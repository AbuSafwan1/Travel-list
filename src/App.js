import { useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────
const initialItems = [
  {
    id: 1,
    description: "Passports",
    quantity: 2,
    packed: false,
    category: "documents",
  },
  {
    id: 2,
    description: "Socks",
    quantity: 12,
    packed: true,
    category: "clothing",
  },
  {
    id: 3,
    description: "Phone Charger",
    quantity: 1,
    packed: false,
    category: "electronics",
  },
  {
    id: 4,
    description: "Sunscreen SPF 50",
    quantity: 2,
    packed: false,
    category: "toiletries",
  },
  {
    id: 5,
    description: "Travel Adapter",
    quantity: 1,
    packed: true,
    category: "electronics",
  },
];

const CATEGORIES = [
  { value: "general", label: "📦 General", color: "#94a3b8" },
  { value: "documents", label: "📄 Documents", color: "#60a5fa" },
  { value: "clothing", label: "👕 Clothing", color: "#f472b6" },
  { value: "electronics", label: "🔌 Electronics", color: "#a78bfa" },
  { value: "toiletries", label: "🧴 Toiletries", color: "#34d399" },
  { value: "food", label: "🍎 Food", color: "#fb923c" },
];

const TIPS = [
  "Roll clothes instead of folding to save space.",
  "Pack a power bank — always.",
  "Keep essentials in your carry-on.",
  "Photograph your passport before you travel.",
  "One pair of shoes per week is enough.",
];

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all");

  const filteredItems =
    filter === "packed"
      ? items.filter((i) => i.packed)
      : filter === "unpacked"
        ? items.filter((i) => !i.packed)
        : items;

  const handleAddItem = useCallback((newItem) => {
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const handleDeleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleToggleItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item,
      ),
    );
  }, []);

  const handleClearList = useCallback(() => {
    if (
      window.confirm("Clear your entire packing list? This cannot be undone.")
    )
      setItems([]);
  }, []);

  const handleClearPacked = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.packed));
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="main-layout">
        <aside className="sidebar">
          <Stats items={items} onClearPacked={handleClearPacked} />
          <FilterPanel filter={filter} onFilterChange={setFilter} />
          <TripTips />
        </aside>
        <section className="content">
          <Form onAddItem={handleAddItem} />
          <PackingList
            items={filteredItems}
            totalItems={items.length}
            onDeleteItem={handleDeleteItem}
            onToggleItem={handleToggleItem}
            onClearList={handleClearList}
          />
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
function Header() {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo-mark">✈</div>
          <div>
            <h1 className="header__title">Far Away</h1>
            <p className="header__sub">Your Smart Travel Companion</p>
          </div>
        </div>
        <div className="header__date">
          <span>📅</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM
// ─────────────────────────────────────────────────────────────
function Form({ onAddItem }) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("general");

  function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    onAddItem({
      id: Date.now(),
      description: description.trim(),
      quantity,
      category,
      packed: false,
    });
    setDescription("");
    setQuantity(1);
    setCategory("general");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form__title">
        <span className="form__title-icon">+</span> Add New Item
      </h2>
      <div className="form__fields">
        <div className="form__field form__field--sm">
          <label className="form__label">Qty</label>
          <select
            className="form__select"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="form__field form__field--grow">
          <label className="form__label">Item</label>
          <input
            className="form__input"
            type="text"
            placeholder="What do you need to pack?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="form__field form__field--md">
          <label className="form__label">Category</label>
          <select
            className="form__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button className="form__btn" type="submit">
          Add
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// PACKING LIST
// ─────────────────────────────────────────────────────────────
function PackingList({
  items,
  totalItems,
  onDeleteItem,
  onToggleItem,
  onClearList,
}) {
  const [sortBy, setSortBy] = useState("newest");

  const sorted = [...items].sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    if (sortBy === "name") return a.description.localeCompare(b.description);
    if (sortBy === "quantity") return b.quantity - a.quantity;
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "packed") return Number(a.packed) - Number(b.packed);
    return 0;
  });

  const grouped = sorted.reduce((acc, item) => {
    const cat = item.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="list-panel">
      <div className="list-panel__toolbar">
        <p className="list-panel__count">
          {items.length} of {totalItems} items
        </p>
        <div className="list-panel__controls">
          <select
            className="list-panel__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">↓ Newest first</option>
            <option value="name">A–Z by name</option>
            <option value="quantity">Qty: high–low</option>
            <option value="category">By category</option>
            <option value="packed">Unpacked first</option>
          </select>
          {totalItems > 0 && (
            <button className="btn-danger" onClick={onClearList}>
              🗑 Clear All
            </button>
          )}
        </div>
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🗺️</div>
          <h3>Nothing here yet</h3>
          <p>Add your first item above to start packing!</p>
        </div>
      )}

      <div className="items-container">
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catInfo =
            CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0];
          return (
            <div key={cat} className="item-group">
              <div
                className="item-group__header"
                style={{ "--cat-color": catInfo.color }}
              >
                <span>{catInfo.label}</span>
                <span className="item-group__badge">{catItems.length}</span>
              </div>
              <ul className="item-group__list">
                {catItems.map((item, i) => (
                  <Item
                    key={item.id}
                    item={item}
                    index={i}
                    onDelete={onDeleteItem}
                    onToggle={onToggleItem}
                    catColor={catInfo.color}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ITEM ROW
// ─────────────────────────────────────────────────────────────
function Item({ item, index, onDelete, onToggle, catColor }) {
  return (
    <li
      className={`item ${item.packed ? "item--packed" : ""}`}
      style={{ animationDelay: `${index * 0.04}s`, "--cat-color": catColor }}
    >
      <label className="item__check-wrapper">
        <input
          type="checkbox"
          className="item__checkbox"
          checked={item.packed}
          onChange={() => onToggle(item.id)}
        />
        <span className="item__checkmark">{item.packed ? "✓" : ""}</span>
      </label>
      <div className="item__body">
        <span className="item__qty">{item.quantity}×</span>
        <span className="item__name">{item.description}</span>
      </div>
      {item.packed && <span className="item__done-tag">Packed</span>}
      <button
        className="item__delete"
        onClick={() => onDelete(item.id)}
        aria-label={`Remove ${item.description}`}
      >
        ×
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────
function Stats({ items, onClearPacked }) {
  const total = items.length;
  const packed = items.filter((i) => i.packed).length;
  const percent = total === 0 ? 0 : Math.round((packed / total) * 100);
  const circumference = 2 * Math.PI * 50; // r=50

  const message =
    percent === 100 && total > 0
      ? { text: "All packed! Bon voyage! ✈️", cls: "msg--great" }
      : percent >= 75
        ? { text: "Almost ready to go!", cls: "msg--good" }
        : percent >= 40
          ? { text: "Making good progress…", cls: "msg--mid" }
          : total === 0
            ? { text: "Start adding items above", cls: "msg--empty" }
            : { text: "Keep packing!", cls: "msg--low" };

  return (
    <div className="stats-card">
      <h3 className="stats-card__heading">Packing Progress</h3>
      <div className="stats-card__ring-wrapper">
        <svg className="stats-card__ring" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5b041" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <circle className="ring-track" cx="60" cy="60" r="50" />
          <circle
            className="ring-fill"
            cx="60"
            cy="60"
            r="50"
            stroke="url(#ringGrad)"
            strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          />
        </svg>
        <div className="stats-card__ring-label">
          <span className="stats-pct">{percent}%</span>
          <span className="stats-pct-sub">packed</span>
        </div>
      </div>

      <div className="stats-numbers">
        <div className="stats-num">
          <span className="stats-num__val">{total}</span>
          <span className="stats-num__label">Total</span>
        </div>
        <div className="stats-num">
          <span className="stats-num__val stats-num__val--teal">{packed}</span>
          <span className="stats-num__label">Packed</span>
        </div>
        <div className="stats-num">
          <span className="stats-num__val stats-num__val--amber">
            {total - packed}
          </span>
          <span className="stats-num__label">Left</span>
        </div>
      </div>

      <p className={`stats-card__message ${message.cls}`}>{message.text}</p>

      {packed > 0 && (
        <button className="stats-card__clear-btn" onClick={onClearPacked}>
          Remove packed items
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────────────────────
function FilterPanel({ filter, onFilterChange }) {
  const filters = [
    { value: "all", label: "All Items", icon: "📋" },
    { value: "unpacked", label: "Still Needed", icon: "📦" },
    { value: "packed", label: "Packed", icon: "✅" },
  ];
  return (
    <div className="filter-card">
      <h3 className="filter-card__heading">Filter View</h3>
      <div className="filter-card__options">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? "filter-btn--active" : ""}`}
            onClick={() => onFilterChange(f.value)}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TRIP TIPS
// ─────────────────────────────────────────────────────────────
function TripTips() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return (
    <div className="tips-card">
      <h3 className="tips-card__heading">
        <span>💡</span> Travel Tip
      </h3>
      <p className="tips-card__text">"{tip}"</p>
    </div>
  );
}
