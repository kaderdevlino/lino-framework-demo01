from __future__ import unicode_literals
from lino.api import dd,rt
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.encoding import python_2_unicode_compatible

@dd.python_2_unicode_compatible
class Client1(dd.Model):
    first_name = models.CharField("First name", max_length=50,blank=True,null=True)
    address = models.CharField("Address", max_length=50,blank=True,null=True)

    def __str__(self):
        return "%s, @:%s" % (self.first_name, self.address)

class Product(dd.Model):
    product_name = models.CharField("Product ", max_length=25,null=True , blank=True)
    product_type = models.CharField("Product Type", max_length=25, null=True, blank=True)
    #product_price= models.DecimalField("Price", decimal_places=2, max_digits=10)
    #product_qt=models.IntegerField("Quantity")
    product_qt = dd.QuantityField()#modified with Hand only
    last_qt = dd.QuantityField(default='0')
    rest_qt = dd.QuantityField()
    #new_qt = dd.QuantityField()
    new_qt = models.BooleanField(default=False)
    product_price = dd.PriceField()

    def __str__(self):
        #not work self.product_qt = self.product_qt - Delivery.qty
        return "%s ,%s EUR |*%s EUR*" % (self.product_name, self.product_price, self.product_qt * self.product_price)
    

class Delivery(dd.Model):

    client1 = dd.ForeignKey(Client1)
    product = dd.ForeignKey(Product)
    designation = models.CharField("Designation",default='give_same_Product_Name', max_length=40, null=True,blank=True)
    #price = models.DecimalField("Price", decimal_places=2, max_digits=10)
    price=dd.PriceField(default=0)
    discount=dd.QuantityField()
    #date = models.DateField(auto_now=True) for update auto_now_add for create
    date = models.DateField(auto_now_add=True)
    hour = models.TimeField(auto_now_add=True)
    qty=dd.QuantityField(default='1')
    total_d=dd.PriceField(default=0)

    def __str__(self):

        if self.discount is None:
            self.total_d=self.total()
            self.reduce()

            return "%s x %s  = %s EUR" % (self.qty, self.price, self.total_d)
        else:
            self.total_d=self.total()
            self.reduce()


            return "%s x %s  (-%s) = %s EUR" % (self.qty,  self.price, self.discount, self.total_d)


    def total(self):
        if self.discount is None:
            return self.qty * self.price
        else:
            return self.qty * (1 - self.discount) * self.price

    def reduce(self):

        for self.p in Product.objects.all():

             #if self.p.product_name =='apple' :
              #self.p.product_qt = 999
              #self.p.save()

#  collect the product_name
  #       if self.p.product_name == self.product.product_name:
  #          self.designation = self.product.product_name
  #          self.save()

         if self.p.product_price == self.product.product_price:
           self.price = self.product.product_price
           self.save()

         if self.p.product_name == self.designation:
            self.p.last_qt= self.qty
            self.p.save()
            self.p.rest_qt=self.p.product_qt - self.qty
            self.p.save()
            self.p.new_qt=True
            self.p.save()
         if self.p.product_name == self.product.product_name:
               self.designation = self.product.product_name + '+'
               self.save()

         if self.p.product_name == self.product.product_name:
               self.p.product_qt = self.product.rest_qt
               self.p.save()







