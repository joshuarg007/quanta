// FAQ page with comprehensive help items
import { useState, useMemo } from 'react';
import { faqItems, faqCategories } from '../data/faqData';
import type { FAQItem } from '../data/faqData';
import './FAQ.css';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredItems.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about QUANTA</p>
      </div>

      <div className="faq-controls">
        <div className="faq-search">
          <span className="search-icon">&#x1F50D;</span>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              &#x2715;
            </button>
          )}
        </div>

        <div className="faq-categories">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="faq-actions">
        <span className="results-count">
          {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
        </span>
        <div className="expand-controls">
          <button onClick={expandAll}>Expand All</button>
          <button onClick={collapseAll}>Collapse All</button>
        </div>
      </div>

      <div className="faq-list">
        {filteredItems.length === 0 ? (
          <div className="faq-empty">
            <span className="empty-icon">&#x1F914;</span>
            <p>No questions match your search.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <FAQAccordionItem
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))
        )}
      </div>

      <div className="faq-footer">
        <p>Can't find what you're looking for?</p>
        <a href="/support" className="support-link">
          Contact Support
        </a>
      </div>
    </div>
  );
}

interface FAQAccordionItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ item, isExpanded, onToggle }: FAQAccordionItemProps) {
  const categoryLabels: Record<string, string> = {
    'getting-started': 'Getting Started',
    'simulation': 'Simulation',
    'circuits': 'Circuits',
    'learning': 'Learning',
    'experiments': 'Experiments',
    'account': 'Account',
    'security': 'Security',
    'billing': 'Billing',
  };

  return (
    <div className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
      <button className="faq-question" onClick={onToggle}>
        <div className="question-content">
          <span className="category-tag">{categoryLabels[item.category]}</span>
          <span className="question-text">{item.question}</span>
        </div>
        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="faq-answer">
          <div className="answer-content">
            {item.answer.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**:')) {
                return <h4 key={i}>{paragraph.replace(/\*\*/g, '').replace(':', '')}</h4>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i}>{paragraph.slice(2)}</li>;
              }
              if (paragraph.match(/^\d+\. /)) {
                return <li key={i}>{paragraph.slice(paragraph.indexOf(' ') + 1)}</li>;
              }
              if (paragraph.trim() === '') {
                return null;
              }
              return <p key={i}>{paragraph}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
