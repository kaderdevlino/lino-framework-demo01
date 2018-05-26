from lino.projects.std.settings import *


class Site(Site):

    title = "Client System"
    languages = 'en fr de'
    def get_installed_apps(self):

        yield 'client'
        yield 'lino.modlib.export_excel'
        yield 'lino_xl.lib.appypod'
        yield 'lino.modlib.users'
        yield 'lino.modlib.gfks'
        yield super(Site, self).get_installed_apps()

        

    def setup_menu(self, user_type, main):
        super(Site, self).setup_menu(user_type, main)
        m = main.add_menu("client", "Client")

        m.add_action('client.Client1')
        m.add_action('client.Product')
        m.add_action('client.Delivery')
       

SITE = Site(globals())

# your local settings here

DEBUG = True
