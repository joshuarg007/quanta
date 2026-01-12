"""
DRIFT Research Experiments API.

Project DRIFT: Degradation Regimes In Iterated Field Transformations

Investigating behavioral uncertainty in quantum system state evolution under
repeated manipulation, focusing on gradual degradation of stability under
variation in operator ordering and diversity.

Cost Control:
- Only organizations with experiments_limit > 0 can access (typically Axion only)
- check_experiment_limit() before creating experiments
- check_experiment_run_limit() before running experiments
- All counts tracked per organization

Priority Order:
1. Legal Protection - Research data integrity, audit trails
2. Science - Reproducibility, accurate results
3. Cost-Efficiency - Hard limits enforced
4. Functionality - Features work correctly
5. User-Friendliness - Nice to have
"""
import time
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Organization, Experiment, ExperimentRun
from app.core.security import get_current_approved_user, require_role, is_axion_user
from app.core.plans import (
    check_experiment_limit,
    check_experiment_run_limit,
    increment_experiment_count,
    decrement_experiment_count,
    increment_experiment_run_count,
    LimitExceededError,
)
from app.simulation.engine import QuantumSimulator
from app.config import settings

router = APIRouter()

# Initialize simulator for experiment runs
simulator = QuantumSimulator(max_qubits=settings.max_qubits)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class GateConfig(BaseModel):
    """Gate configuration for experiments."""
    type: str
    qubit: int
    control_qubit: Optional[int] = None
    control_qubit2: Optional[int] = None
    parameter: Optional[float] = None


class ExperimentConfig(BaseModel):
    """Configuration for a DRIFT experiment."""
    num_qubits: int = 2
    operator_sequence: List[GateConfig] = []
    iterations: int = 100
    variation_type: Optional[str] = None  # "ordering", "diversity", "both"
    variation_params: Optional[dict] = None
    measurement_basis: str = "computational"  # computational, hadamard, etc.


class ExperimentCreate(BaseModel):
    """Request to create a new experiment."""
    name: str
    hypothesis: Optional[str] = None
    description: Optional[str] = None
    config: ExperimentConfig
    tags: List[str] = []
    random_seed: Optional[int] = None


class ExperimentUpdate(BaseModel):
    """Request to update an experiment."""
    name: Optional[str] = None
    hypothesis: Optional[str] = None
    description: Optional[str] = None
    config: Optional[ExperimentConfig] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


class ExperimentResponse(BaseModel):
    """Experiment response."""
    id: int
    name: str
    hypothesis: Optional[str]
    description: Optional[str]
    config: dict
    status: str
    tags: List[str]
    random_seed: Optional[int]
    version: int
    researcher_id: Optional[int]
    organization_id: int
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    run_count: int = 0

    class Config:
        from_attributes = True


class RunParameters(BaseModel):
    """Parameters for a specific experiment run."""
    operator_sequence_override: Optional[List[GateConfig]] = None
    iterations_override: Optional[int] = None
    random_seed_override: Optional[int] = None
    variation_index: Optional[int] = None  # For parameter sweeps
    notes: Optional[str] = None


class ExperimentRunResponse(BaseModel):
    """Experiment run response."""
    id: int
    experiment_id: int
    parameters: dict
    initial_state: Optional[dict]
    operator_sequence: Optional[List[dict]]
    results: dict
    final_state: Optional[dict]
    iterations: Optional[int]
    execution_time_ms: Optional[int]
    status: str
    error_message: Optional[str]
    executed_at: datetime

    class Config:
        from_attributes = True


class BatchRunRequest(BaseModel):
    """Request to run multiple experiment variations."""
    parameter_sweep: List[RunParameters]
    max_concurrent: int = 1  # Sequential by default for reproducibility


# =============================================================================
# HELPER: Check research access
# =============================================================================

def require_research_access(user: User, org: Organization) -> None:
    """
    Verify user has access to research features.

    Only organizations with experiments_limit > 0 can access.
    Typically only Axion Deep Labs.
    """
    if org.experiments_limit == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Research features are not available on your plan. "
                   "This feature is reserved for authorized research organizations."
        )


# =============================================================================
# EXPERIMENT CRUD
# =============================================================================

@router.post("/experiments", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
def create_experiment(
    data: ExperimentCreate,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Create a new DRIFT experiment.

    Only available to research organizations (Axion Deep Labs).
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    # Check research access
    require_research_access(user, org)

    # COST CONTROL: Check experiment limit
    try:
        check_experiment_limit(org)
    except LimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=e.message,
        )

    # Create experiment
    experiment = Experiment(
        name=data.name,
        hypothesis=data.hypothesis,
        description=data.description,
        config=data.config.model_dump(),
        tags=data.tags,
        random_seed=data.random_seed,
        researcher_id=user.id,
        organization_id=user.organization_id,
        status="draft",
    )
    db.add(experiment)

    # COST CONTROL: Increment count
    increment_experiment_count(db, org)

    db.commit()
    db.refresh(experiment)

    # Get run count
    run_count = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment.id
    ).count()

    return ExperimentResponse(
        id=experiment.id,
        name=experiment.name,
        hypothesis=experiment.hypothesis,
        description=experiment.description,
        config=experiment.config,
        status=experiment.status,
        tags=experiment.tags or [],
        random_seed=experiment.random_seed,
        version=experiment.version,
        researcher_id=experiment.researcher_id,
        organization_id=experiment.organization_id,
        created_at=experiment.created_at,
        updated_at=experiment.updated_at,
        started_at=experiment.started_at,
        completed_at=experiment.completed_at,
        run_count=run_count,
    )


@router.get("/experiments", response_model=List[ExperimentResponse])
def list_experiments(
    status_filter: Optional[str] = None,
    tag: Optional[str] = None,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    List experiments for the user's organization.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    require_research_access(user, org)

    # Build query
    query = db.query(Experiment).filter(
        Experiment.organization_id == user.organization_id
    )

    if status_filter:
        query = query.filter(Experiment.status == status_filter)

    # Note: JSON array contains query varies by DB - simplified here
    experiments = query.order_by(Experiment.updated_at.desc()).all()

    # Filter by tag in Python (for SQLite compatibility)
    if tag:
        experiments = [e for e in experiments if tag in (e.tags or [])]

    result = []
    for exp in experiments:
        run_count = db.query(ExperimentRun).filter(
            ExperimentRun.experiment_id == exp.id
        ).count()

        result.append(ExperimentResponse(
            id=exp.id,
            name=exp.name,
            hypothesis=exp.hypothesis,
            description=exp.description,
            config=exp.config,
            status=exp.status,
            tags=exp.tags or [],
            random_seed=exp.random_seed,
            version=exp.version,
            researcher_id=exp.researcher_id,
            organization_id=exp.organization_id,
            created_at=exp.created_at,
            updated_at=exp.updated_at,
            started_at=exp.started_at,
            completed_at=exp.completed_at,
            run_count=run_count,
        ))

    return result


@router.get("/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(
    experiment_id: int,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Get a specific experiment."""
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    run_count = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment.id
    ).count()

    return ExperimentResponse(
        id=experiment.id,
        name=experiment.name,
        hypothesis=experiment.hypothesis,
        description=experiment.description,
        config=experiment.config,
        status=experiment.status,
        tags=experiment.tags or [],
        random_seed=experiment.random_seed,
        version=experiment.version,
        researcher_id=experiment.researcher_id,
        organization_id=experiment.organization_id,
        created_at=experiment.created_at,
        updated_at=experiment.updated_at,
        started_at=experiment.started_at,
        completed_at=experiment.completed_at,
        run_count=run_count,
    )


@router.put("/experiments/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    data: ExperimentUpdate,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Update an experiment.

    Incrementing version when config changes for reproducibility tracking.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Track if config changed (for versioning)
    config_changed = False

    if data.name is not None:
        experiment.name = data.name
    if data.hypothesis is not None:
        experiment.hypothesis = data.hypothesis
    if data.description is not None:
        experiment.description = data.description
    if data.config is not None:
        experiment.config = data.config.model_dump()
        config_changed = True
    if data.tags is not None:
        experiment.tags = data.tags
    if data.status is not None:
        valid_statuses = {"draft", "running", "paused", "completed", "archived"}
        if data.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        experiment.status = data.status

        # Track status transitions
        if data.status == "running" and not experiment.started_at:
            experiment.started_at = datetime.utcnow()
        elif data.status == "completed":
            experiment.completed_at = datetime.utcnow()

    # Increment version if config changed
    if config_changed:
        experiment.version += 1

    experiment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(experiment)

    run_count = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment.id
    ).count()

    return ExperimentResponse(
        id=experiment.id,
        name=experiment.name,
        hypothesis=experiment.hypothesis,
        description=experiment.description,
        config=experiment.config,
        status=experiment.status,
        tags=experiment.tags or [],
        random_seed=experiment.random_seed,
        version=experiment.version,
        researcher_id=experiment.researcher_id,
        organization_id=experiment.organization_id,
        created_at=experiment.created_at,
        updated_at=experiment.updated_at,
        started_at=experiment.started_at,
        completed_at=experiment.completed_at,
        run_count=run_count,
    )


@router.delete("/experiments/{experiment_id}")
def delete_experiment(
    experiment_id: int,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Delete an experiment and all its runs.

    Use with caution - this deletes research data.
    Consider archiving instead (status="archived").
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Warn if experiment has runs
    run_count = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment.id
    ).count()

    db.delete(experiment)  # Cascades to runs

    # COST CONTROL: Decrement count
    decrement_experiment_count(db, org)

    db.commit()

    return {
        "status": "deleted",
        "id": experiment_id,
        "runs_deleted": run_count,
        "warning": "Research data permanently deleted" if run_count > 0 else None,
    }


# =============================================================================
# EXPERIMENT RUNS
# =============================================================================

@router.post("/experiments/{experiment_id}/run", response_model=ExperimentRunResponse)
def run_experiment(
    experiment_id: int,
    params: Optional[RunParameters] = None,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Execute a single run of an experiment.

    Records initial state, operator sequence, and results for reproducibility.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    # COST CONTROL: Check experiment run limit
    try:
        check_experiment_run_limit(org)
    except LimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=e.message,
        )

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Get config
    config = experiment.config
    params = params or RunParameters()

    # Determine run parameters
    num_qubits = config.get("num_qubits", 2)
    iterations = params.iterations_override or config.get("iterations", 100)
    seed = params.random_seed_override or experiment.random_seed

    # Build operator sequence
    if params.operator_sequence_override:
        operator_sequence = [g.model_dump() for g in params.operator_sequence_override]
    else:
        operator_sequence = config.get("operator_sequence", [])

    # Create run record
    run = ExperimentRun(
        experiment_id=experiment.id,
        parameters={
            "iterations": iterations,
            "random_seed": seed,
            "variation_index": params.variation_index,
            "notes": params.notes,
        },
        operator_sequence=operator_sequence,
        status="running",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Execute simulation
    start_time = time.time()

    try:
        # Convert operator sequence to gate format expected by simulator
        gates = []
        for i, op in enumerate(operator_sequence):
            gates.append({
                "id": f"gate_{i}",
                "type": op.get("type"),
                "qubit": op.get("qubit"),
                "controlQubit": op.get("control_qubit"),
                "controlQubit2": op.get("control_qubit2"),
                "parameter": op.get("parameter"),
                "step": i,
            })

        # Run simulation
        result = simulator.simulate(
            num_qubits=num_qubits,
            gates=gates,
            shots=iterations,
        )

        execution_time_ms = int((time.time() - start_time) * 1000)

        # Store results
        run.initial_state = {"basis_state": "|" + "0" * num_qubits + ">"}
        run.results = {
            "measurements": result.get("measurements", {}),
            "probabilities": result.get("probabilities", []),
            "statevector_norm": sum(abs(a)**2 for a in result.get("statevector", [])),
        }
        run.final_state = {
            "amplitudes": [
                {"real": a.real, "imag": a.imag}
                for a in result.get("statevector", [])
            ],
        }
        run.iterations = iterations
        run.execution_time_ms = execution_time_ms
        run.status = "completed"

        # COST CONTROL: Increment run count after success
        increment_experiment_run_count(db, org)

        # Update experiment status if first run
        if experiment.status == "draft":
            experiment.status = "running"
            experiment.started_at = datetime.utcnow()

        db.commit()
        db.refresh(run)

    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)
        run.execution_time_ms = int((time.time() - start_time) * 1000)
        db.commit()
        db.refresh(run)

    return ExperimentRunResponse(
        id=run.id,
        experiment_id=run.experiment_id,
        parameters=run.parameters,
        initial_state=run.initial_state,
        operator_sequence=run.operator_sequence,
        results=run.results,
        final_state=run.final_state,
        iterations=run.iterations,
        execution_time_ms=run.execution_time_ms,
        status=run.status,
        error_message=run.error_message,
        executed_at=run.executed_at,
    )


@router.post("/experiments/{experiment_id}/run/batch", response_model=List[ExperimentRunResponse])
def run_experiment_batch(
    experiment_id: int,
    batch: BatchRunRequest,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Execute multiple runs with parameter variations.

    Useful for parameter sweeps and systematic exploration.
    Runs are executed sequentially for reproducibility.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Check we have enough quota for all runs
    runs_needed = len(batch.parameter_sweep)
    if org.experiment_runs_limit != -1:
        remaining = org.experiment_runs_limit - org.experiment_runs_this_month
        if runs_needed > remaining:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Batch requires {runs_needed} runs but only {remaining} remaining this month."
            )

    results = []
    for params in batch.parameter_sweep:
        # Run each experiment (reusing the single run logic)
        try:
            result = run_experiment(
                experiment_id=experiment_id,
                params=params,
                user=user,
                db=db,
            )
            results.append(result)
        except HTTPException:
            # If we hit a limit mid-batch, return what we have
            break

    return results


@router.get("/experiments/{experiment_id}/runs", response_model=List[ExperimentRunResponse])
def list_experiment_runs(
    experiment_id: int,
    status_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """List all runs for an experiment."""
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    query = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment_id
    )

    if status_filter:
        query = query.filter(ExperimentRun.status == status_filter)

    runs = query.order_by(ExperimentRun.executed_at.desc()).offset(offset).limit(limit).all()

    return [
        ExperimentRunResponse(
            id=run.id,
            experiment_id=run.experiment_id,
            parameters=run.parameters,
            initial_state=run.initial_state,
            operator_sequence=run.operator_sequence,
            results=run.results,
            final_state=run.final_state,
            iterations=run.iterations,
            execution_time_ms=run.execution_time_ms,
            status=run.status,
            error_message=run.error_message,
            executed_at=run.executed_at,
        )
        for run in runs
    ]


@router.get("/experiments/{experiment_id}/runs/{run_id}", response_model=ExperimentRunResponse)
def get_experiment_run(
    experiment_id: int,
    run_id: int,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Get a specific experiment run."""
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    run = db.query(ExperimentRun).join(Experiment).filter(
        ExperimentRun.id == run_id,
        ExperimentRun.experiment_id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return ExperimentRunResponse(
        id=run.id,
        experiment_id=run.experiment_id,
        parameters=run.parameters,
        initial_state=run.initial_state,
        operator_sequence=run.operator_sequence,
        results=run.results,
        final_state=run.final_state,
        iterations=run.iterations,
        execution_time_ms=run.execution_time_ms,
        status=run.status,
        error_message=run.error_message,
        executed_at=run.executed_at,
    )


# =============================================================================
# DATA EXPORT
# =============================================================================

@router.get("/experiments/{experiment_id}/export")
def export_experiment_data(
    experiment_id: int,
    format: str = "json",  # json, csv (future)
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Export experiment and all run data.

    For reproducibility and external analysis.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    require_research_access(user, org)

    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.organization_id == user.organization_id,
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    runs = db.query(ExperimentRun).filter(
        ExperimentRun.experiment_id == experiment_id
    ).order_by(ExperimentRun.executed_at).all()

    export_data = {
        "export_timestamp": datetime.utcnow().isoformat(),
        "export_format_version": "1.0",
        "experiment": {
            "id": experiment.id,
            "name": experiment.name,
            "hypothesis": experiment.hypothesis,
            "description": experiment.description,
            "config": experiment.config,
            "status": experiment.status,
            "tags": experiment.tags,
            "random_seed": experiment.random_seed,
            "version": experiment.version,
            "created_at": experiment.created_at.isoformat(),
            "updated_at": experiment.updated_at.isoformat(),
            "started_at": experiment.started_at.isoformat() if experiment.started_at else None,
            "completed_at": experiment.completed_at.isoformat() if experiment.completed_at else None,
        },
        "runs": [
            {
                "id": run.id,
                "parameters": run.parameters,
                "initial_state": run.initial_state,
                "operator_sequence": run.operator_sequence,
                "results": run.results,
                "final_state": run.final_state,
                "iterations": run.iterations,
                "execution_time_ms": run.execution_time_ms,
                "status": run.status,
                "error_message": run.error_message,
                "executed_at": run.executed_at.isoformat(),
            }
            for run in runs
        ],
        "summary": {
            "total_runs": len(runs),
            "completed_runs": len([r for r in runs if r.status == "completed"]),
            "failed_runs": len([r for r in runs if r.status == "failed"]),
            "total_execution_time_ms": sum(r.execution_time_ms or 0 for r in runs),
        },
    }

    return export_data


# =============================================================================
# USAGE INFO
# =============================================================================

@router.get("/experiments/usage")
def get_experiment_usage(
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Get experiment usage stats for the organization."""
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    # Check if research is available
    research_available = org.experiments_limit != 0

    return {
        "research_available": research_available,
        "experiments": {
            "current": org.experiments_count,
            "limit": org.experiments_limit if org.experiments_limit != -1 else "unlimited",
            "remaining": (org.experiments_limit - org.experiments_count) if org.experiments_limit > 0 else "unlimited",
        },
        "experiment_runs": {
            "current": org.experiment_runs_this_month,
            "limit": org.experiment_runs_limit if org.experiment_runs_limit != -1 else "unlimited",
            "remaining": (org.experiment_runs_limit - org.experiment_runs_this_month) if org.experiment_runs_limit > 0 else "unlimited",
            "resets_at": org.usage_month_reset.isoformat() if org.usage_month_reset else None,
        },
        "is_axion": is_axion_user(user),
    }
