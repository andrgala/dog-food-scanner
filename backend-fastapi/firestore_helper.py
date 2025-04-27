def save_product(data: dict, db):
    """
    Save a product into Firestore.
    """
    db.collection('dog_food_products').add(data)

def search_products(query: str, db):
    """
    Search for products whose productName starts with the query string.
    """
    products_ref = db.collection('dog_food_products')
    query_ref = products_ref.where('productName', '>=', query).where('productName', '<=', query + '\uf8ff')
    results = query_ref.stream()
    products = [{"id": doc.id, **doc.to_dict()} for doc in results]
    return products
