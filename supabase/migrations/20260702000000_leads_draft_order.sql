-- Guarda el draft order de Shopify creado para el carrito abandonado, asi
-- se puede actualizar (en vez de duplicar) mientras la persona sigue
-- escribiendo, y borrar cuando el pedido real se completa.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS shopify_draft_order_id TEXT;
