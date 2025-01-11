-- nsert an artificial price update for each product without a price update on the creation date
INSERT INTO public.price_updates (product_id, old_price, new_price, updated_at)
SELECT 
    p.id AS product_id,
    COALESCE(
        -- Use the old price of the oldest price update if it exists
        (SELECT old_price FROM public.price_updates WHERE product_id = p.id ORDER BY updated_at ASC LIMIT 1),
        -- Otherwise, use the current price of the product
        p.current_price
    ) AS old_price,
    COALESCE(
        (SELECT old_price FROM public.price_updates WHERE product_id = p.id ORDER BY updated_at ASC LIMIT 1),
        p.current_price
    ) AS new_price,
    p.creation_date AS updated_at
FROM public.products p
WHERE NOT EXISTS (
    SELECT 1
    FROM public.price_updates pu
    WHERE pu.product_id = p.id
    AND pu.updated_at::DATE = p.creation_date::DATE
);
