from client.models import Client1, Product ,Delivery


def objects():
    p = Client1(first_name="kader",address="Annaba")
    yield p
    yield Client1(first_name="anis",address="Annaba")
    yield Client1(first_name="imad", address="alger")
    yield Client1(first_name="raouf", address="vienna")
    yield Client1(first_name="hocine", address="vienna")

    yield Product(product_name="bread", product_type="eat",product_price=0.5, product_qt=500,last_qt="0",rest_qt=500)
    yield Product(product_name="milk", product_type="eat",product_price=1, product_qt=600,last_qt="0",rest_qt=600)
    yield Product(product_name="apple", product_type="eat",product_price=1, product_qt=100,last_qt="0",rest_qt=100)
    yield Product(product_name="water", product_type="drink",product_price=0.5, product_qt=500,last_qt="0",rest_qt="500")
'''
    yield Delivery(product=0,designation='bread',price=0.5,discount='10%' ,
                   date='2018-04-24',hour='10:30',qty=10)
    yield Delivery(product=0,designation='bread', price=0.5, discount='10%',
                   date='2018-04-24', hour='10:30', qty=15)
    yield Delivery(product=0,designation='bread', price=0.5, discount='10%',
                   date='2018-04-24', hour='10:30', qty=15)
    yield Delivery(product=0,designation='apple', price=1, discount='10%',
                   date='2018-04-24', hour='10:30', qty=15)
    yield Delivery(product=0,designation='milk', price=0.5, discount='10%',
                   date='2018-04-24', hour='10:30', qty=10)
'''