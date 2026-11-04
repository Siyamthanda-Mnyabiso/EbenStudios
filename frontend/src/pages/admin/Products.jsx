import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../../service/productService";
import Input from "../../components/ui/Input";
import { getProductImage } from "../../lib/productImage";

const emptyForm = { name: "", description: "", price: "", stock: "", tag: "" };

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const previewUrl = useMemo(
        () => (imageFile ? URL.createObjectURL(imageFile) : null),
        [imageFile]
    );

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);
        setError("");

        try {
            setProducts(await getProducts());
        } catch (err) {
            setError(err.message || "Failed to load products.");
        } finally {
            setLoading(false);
        }
    }

    function openAddForm() {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setExistingImageUrl(null);
        setFormError("");
        setFormOpen(true);
    }

    function openEditForm(product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock: product.stock,
            tag: product.tag || "",
        });
        setImageFile(null);
        setExistingImageUrl(product.imageUrl || null);
        setFormError("");
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            const payload = { ...form, image: imageFile };

            if (editingId) {
                await updateProduct(editingId, payload);
            } else {
                await createProduct(payload);
            }

            closeForm();
            await loadProducts();
        } catch (err) {
            setFormError(err.message || "Failed to save product.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);

        try {
            await deleteProduct(id);
            setConfirmDeleteId(null);
            await loadProducts();
        } catch (err) {
            setError(err.message || "Failed to delete product.");
        } finally {
            setDeletingId(null);
        }
    }

    const displayImage = previewUrl || existingImageUrl;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="headline">
                    Products
                </h1>

                <button
                    onClick={openAddForm}
                    className="inline-flex items-center gap-2 min-h-12 bg-ember text-white px-5 font-bold hover:bg-ember-deep transition-colors"
                >
                    <Plus size={18} />
                    Add product
                </button>
            </div>

            {formOpen && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-line p-6 mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">
                            {editingId ? "Edit product" : "New product"}
                        </h2>

                        <button type="button" onClick={closeForm} aria-label="Close form" className="inline-flex items-center justify-center w-12 h-12 -mr-3 text-mute hover:text-ink transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {formError && (
                        <p className="field-error mb-4">{formError}</p>
                    )}

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-24 bg-paper-deep overflow-hidden shrink-0">
                            {displayImage && (
                                <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                            )}
                        </div>

                        <label className="inline-flex items-center gap-2 min-h-12 border border-ink px-4 font-bold cursor-pointer hover:bg-ink hover:text-paper transition-colors focus-within:outline-2 focus-within:outline-ember">
                            <Upload size={16} />
                            {imageFile ? imageFile.name : "Upload image"}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <Input label="Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Input label="Tag" optional placeholder="For example New or Limited" type="text" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                        <Input label="Price (R)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />

                        <div className="sm:col-span-2">
                            <label htmlFor="product-description" className="field-label">
                                Description <span className="font-normal text-mute">(optional)</span>
                            </label>
                            <textarea
                                id="product-description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="field"
                                rows={3}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="min-h-12 bg-ember text-white px-6 font-bold hover:bg-ember-deep transition-colors disabled:opacity-60"
                    >
                        {saving ? "Saving" : editingId ? "Save changes" : "Create product"}
                    </button>
                </form>
            )}

            {error && (
                <p className="field-error mb-4">{error}</p>
            )}

            <div className="bg-white border border-line overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-line text-sm text-mute">
                            <th className="px-6 py-4 font-medium" aria-label="Image"></th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Stock</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-mute">
                                    Loading products
                                </td>
                            </tr>
                        )}

                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-mute">
                                    No products yet.
                                </td>
                            </tr>
                        )}

                        {!loading && products.map((product) => (
                            <tr key={product.id} className="border-b border-line last:border-0">
                                <td className="px-6 py-4">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 font-semibold">{product.name}</td>
                                <td className="px-6 py-4 text-ink-soft">
                                    R {Number(product.price).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-ink-soft">{product.stock}</td>
                                <td className="px-6 py-4">
                                    {confirmDeleteId === product.id ? (
                                        <div className="flex items-center justify-end gap-3 text-sm">
                                            <span className="text-mute">Delete?</span>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="inline-flex items-center min-h-12 px-2 font-bold text-danger hover:underline disabled:opacity-60"
                                            >
                                                {deletingId === product.id ? "Deleting" : "Confirm"}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="inline-flex items-center min-h-12 px-2 text-ink-soft hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3 text-mute">
                                            <button
                                                onClick={() => openEditForm(product)}
                                                className="inline-flex items-center justify-center w-12 h-12 hover:text-ink transition-colors"
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(product.id)}
                                                className="hover:text-danger transition"
                                                aria-label="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
