
from lino.api import dd
##hey there

class Clients(dd.Table):
    
    model = 'client.Client1'

    detail_layout = """
    id first_name
    address
    
    """

    insert_layout = """
    first_name
    address
    """

class Products(dd.Table):
    model = 'client.Product'

    detail_layout = """
    product_name 
    product_type
    product_price
    product_qt
    last_qt
    rest_qt
    new_qt
    """
    insert_layout = """
    product_name
    product_type
    product_qt
    rest_qt
    product_price
    """
class Deliverys(dd.Table):
    model='client.Delivery'

    detail_layout="""
    client1
    product
    designation
    discount
    qty
    date
    hour
    price
    total_d
     
    """

    insert_layout = """
    client1
    product
    designation
    discount
    qty
    
    """