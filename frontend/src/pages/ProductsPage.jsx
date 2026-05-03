import { PackagePlus, Search, Sheet, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportProducts } from '../utils/exportExcel';
import { filterByText, formatCurrency } from '../utils/formatters';

const EMPTY_FORM = {
  name: '',
  price: '',
};

export default function ProductsPage() {
  const { products, addProductRecord, deleteProductRecord } = useProcurement();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(
    () => filterByText(products, search, (product) => [product.id, product.name, product.price]),
    [products, search],
  );

  function handleSubmit(event) {
    event.preventDefault();

    try {
      addProductRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis only works when the product is not already used by a purchase request.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteProductRecord(product.id);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="two-column-grid">
        <Card
          title="Add Product"
          subtitle="Register new products so they can be reused throughout the procurement flow."
          action={<span className="section-chip">Master Data</span>}
        >
          <ActionHint
            title="Why this matters"
            description="Products created here become selectable inside Purchase Requests and determine invoice amounts."
          />
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter product name"
              />
            </label>

            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="Enter price"
              />
            </label>

            <button className="primary-button" type="submit">
              <PackagePlus size={16} />
              Add Product
            </button>
            <p className="form-helper">Creates a new reusable product record and saves it instantly to localStorage.</p>
          </form>
        </Card>

        <Card
          title="Search And Export"
          subtitle="Find products quickly and export the current master list for reporting."
          action={
            <button className="secondary-button" onClick={() => exportProducts(products)} type="button">
              <Sheet size={16} />
              Export Excel
            </button>
          }
        >
          <ActionHint
            title="What this button does"
            description="Export Excel downloads the full persisted product list as a spreadsheet using the xlsx library."
          />
          <div className="field-with-icon">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, name, or price"
            />
          </div>
        </Card>
      </div>

      <Card title="Product List" subtitle={`${filteredProducts.length} product(s) shown`}>
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="No products found"
            description="Try a different search or add a new product to populate the master catalog."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="danger-button small-button"
                          onClick={() => handleDelete(product)}
                          type="button"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
