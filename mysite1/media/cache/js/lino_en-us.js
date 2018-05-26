/*
 Copyright 2009-2015 Luc Saffre
 License: BSD (see file COPYING for details)
*/

// lino.js --- generated Tue Apr  3 10:06:28 2018 by yet another Lino application for None.
Ext.BLANK_IMAGE_URL = '/static/ext-3.3.1/resources/images/default/s.gif';
LANGUAGE_CHOICES = [ [ "en-us", "American English" ] ];
MEDIA_URL = "/media/";

// hack to add a toCamel function, inspired by
// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
String.prototype.toCamel = function(){
  //~ return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
  //~ return this;
  return this.replace(/([A-Z])([A-Z]+)/g, function(match,p1,p2,offset,string){
      //~ console.log("20131005 got ",arguments);
      return p1 + p2.toLowerCase();});
};


// 20151126 hack to modify Ext.EventObjectImpl.isSpecialKey() which
// returned false for Ctrl-S when called from a keyup handler (namely
// ComboBox.onLoad)

Ext.EventObjectImpl.prototype.isSpecialKey = function(){
    // same as original except for one line
    var k = this.normalizeKey(this.keyCode);
    // return (this.type == 'keypress' && this.ctrlKey) ||
    return (this.ctrlKey) ||
        this.isNavKeyPress() ||
        (k == this.BACKSPACE) || 
        (k >= 16 && k <= 20) || 
        (k >= 44 && k <= 46);   
};





/* MonthPickerPlugin: thanks to keypoint @ sencha forum
   http://www.sencha.com/forum/showthread.php?74002-3.x-Ext.ux.MonthMenu&p=356860#post356860
*/
Ext.namespace('Ext.ux'); 

Ext.ux.MonthPickerPlugin = function() { 
    var picker; 
    var oldDateDefaults; 

    this.init = function(pk) { 
        picker = pk; 
        picker.onTriggerClick = picker.onTriggerClick.createSequence(onClick); 
        picker.getValue = picker.getValue.createInterceptor(setDefaultMonthDay).createSequence(restoreDefaultMonthDay); 
        picker.beforeBlur = picker.beforeBlur.createInterceptor(setDefaultMonthDay).createSequence(restoreDefaultMonthDay); 
    }; 

    function setDefaultMonthDay() { 
        oldDateDefaults = Date.defaults.d; 
        Date.defaults.d = 1; 
        return true; 
    } 

    function restoreDefaultMonthDay(ret) { 
        Date.defaults.d = oldDateDefaults; 
        return ret; 
    } 

    function onClick(e, el, opt) { 
        var p = picker.menu.picker; 
        p.activeDate = p.activeDate.getFirstDateOfMonth(); 
        if (p.value) { 
            p.value = p.value.getFirstDateOfMonth(); 
        } 

        p.showMonthPicker(); 
         
        if (!p.disabled) { 
            p.monthPicker.stopFx(); 
            p.monthPicker.show(); 

            p.mun(p.monthPicker, 'click', p.onMonthClick, p); 
            p.mun(p.monthPicker, 'dblclick', p.onMonthDblClick, p); 
            p.onMonthClick = p.onMonthClick.createSequence(pickerClick); 
            p.onMonthDblClick = p.onMonthDblClick.createSequence(pickerDblclick); 
            p.mon(p.monthPicker, 'click', p.onMonthClick, p); 
            p.mon(p.monthPicker, 'dblclick', p.onMonthDblClick, p); 
        } 
    } 

    function pickerClick(e, t) { 
        var el = new Ext.Element(t); 
        if (el.is('button.x-date-mp-cancel')) { 
            picker.menu.hide(); 
        } else if(el.is('button.x-date-mp-ok')) { 
            var p = picker.menu.picker; 
            p.setValue(p.activeDate); 
            p.fireEvent('select', p, p.value); 
        } 
    } 

    function pickerDblclick(e, t) { 
        var el = new Ext.Element(t); 
        if (el.parent() 
            && (el.parent().is('td.x-date-mp-month') 
            || el.parent().is('td.x-date-mp-year'))) { 

            var p = picker.menu.picker; 
            p.setValue(p.activeDate); 
            p.fireEvent('select', p, p.value); 
        } 
    } 
}; 

Ext.preg('monthPickerPlugin', Ext.ux.MonthPickerPlugin);  


/**
JC Watsons solution (adapted to ExtJS 3.3.1 by LS) is elegant and simple:
`A "fix" for unchecked checkbox submission  behaviour
<http://www.sencha.com/forum/showthread.php?28449>`_

Added special handling for checkbox inputs. 
ExtJS defines disabled checkboxes `readonly`, not `disabled` as for other inputs.

*/
Ext.lib.Ajax.serializeForm = function(form) {
    // console.log('20170731 linolib.js serializeForm', form);
    var fElements = form.elements || (document.forms[form] || Ext.getDom(form)).elements, 
        hasSubmit = false, 
        encoder = encodeURIComponent, 
        name, 
        data = '', 
        type, 
        hasValue;

    Ext.each(fElements, function(element){
        name = element.name;
        type = element.type;

        if (!element.disabled && name && !(type == 'checkbox' && element.readonly)) {
            if (/select-(one|multiple)/i.test(type)) {
                Ext.each(element.options, function(opt){
                    if (opt.selected) {
                        hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                        data += String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                    }
                });
            } else if (!(/file|undefined|reset|button/i.test(type))) {
                //~ if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                if (!(type == 'submit' && hasSubmit)) {
                    if (type == 'checkbox') {
                        //~ console.log('20111001',element,'data += ',encoder(name) + '=' + (element.checked ? 'on' : 'off') + '&');
                        data += encoder(name) + '=' + (element.checked ? 'on' : 'off') + '&';
                    } else {
                        //~ console.log('20111001',element,'data += ',encoder(name) + '=' + encoder(element.value) + '&');
                        data += encoder(name) + '=' + encoder(element.value) + '&';
                    }
                    hasSubmit = /submit/i.test(type);
                }
            }
        //~ } else {
            //~ console.log(name,type,element.readonly);
        }
    });
    return data.substr(0, data.length - 1);
};



/*
Set a long timeout of fifteen minutes. 
See /blog/2012/0307
*/
Ext.Ajax.timeout = 15 * 60 * 1000; 

/*
 * Thanks to 
 * `huuze <http://stackoverflow.com/users/10040/huuuze>`_ for the question
 * and to 
 * `chrisv <http://stackoverflow.com/users/683808/chrisv>`_
 * for the answer on
 * http://stackoverflow.com/questions/3764589/how-do-i-include-django-1-2s-csrf-token-in-a-javascript-generated-html-form/5485616#5485616
 * 
 * */
 
Ext.Ajax.on('beforerequest', function (conn, options) {
   if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
     if (typeof(options.headers) == "undefined") {
       options.headers = {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')};
     } else {
       options.headers.extend({'X-CSRFToken': Ext.util.Cookies.get('csrftoken')});
     }                        
   }
}, this);


/* This probably worked, but was not used in real world.
My fix for the "Cannot set QuickTips dismissDelay to 0" bug,
see http://www.sencha.com/forum/showthread.php?183515 

*/
// Ext.override(Ext.QuickTip,{
//   showAt : function(xy){
//         var t = this.activeTarget;
//         // console.log("20171024 QuickTip.showAt",this.title,this.dismissDelay,t.dismissDelay);
//         if(t){
//             if(!this.rendered){
//                 this.render(Ext.getBody());
//                 this.activeTarget = t;
//             }
//             if(t.width){
//                 this.setWidth(t.width);
//                 this.body.setWidth(this.adjustBodyWidth(t.width - this.getFrameWidth()));
//                 this.measureWidth = false;
//             } else{
//                 this.measureWidth = true;
//             }
//             this.setTitle(t.title || '');
//             this.body.update(t.text);
//             this.autoHide = t.autoHide;
//             // bugfix by Luc 20120226
//             if (t.dismissDelay != undefined) this.dismissDelay = t.dismissDelay;
//             //~ this.dismissDelay = t.dismissDelay || this.dismissDelay;
//             if(this.lastCls){
//                 this.el.removeClass(this.lastCls);
//                 delete this.lastCls;
//             }
//             if(t.cls){
//                 this.el.addClass(t.cls);
//                 this.lastCls = t.cls;
//             }
//             if(this.anchor){
//                 this.constrainPosition = false;
//             }else if(t.align){ 
//                 xy = this.el.getAlignToXY(t.el, t.align);
//                 this.constrainPosition = false;
//             }else{
//                 this.constrainPosition = true;
//             }
//         }
//         Ext.QuickTip.superclass.showAt.call(this, xy);
//     }
// });

/*
Another hack. See /docs/blog/2012/0228
*/
Ext.Element.addMethods(
    function() {
        var VISIBILITY      = "visibility",
            DISPLAY         = "display",
            HIDDEN          = "hidden",
            NONE            = "none",
            XMASKED         = "x-masked",
            XMASKEDRELATIVE = "x-masked-relative",
            data            = Ext.Element.data;

        return {
            
            mask : function(msg, msgCls) {
                var me  = this,
                    dom = me.dom,
                    dh  = Ext.DomHelper,
                    EXTELMASKMSG = "ext-el-mask-msg",
                    el,
                    mask;
                // removed the following lines. See /docs/blog/2012/0228
                //~ if (!(/^body/i.test(dom.tagName) && me.getStyle('position') == 'static')) {
                    //~ console.log(20120228,dom.tagName,me);
                    //~ me.addClass(XMASKEDRELATIVE); 
                //~ }
                if (el = data(dom, 'maskMsg')) {
                    el.remove();
                }
                if (el = data(dom, 'mask')) {
                    el.remove();
                }

                mask = dh.append(dom, {cls : "ext-el-mask"}, true);
                data(dom, 'mask', mask);

                me.addClass(XMASKED);
                mask.setDisplayed(true);
                
                if (typeof msg == 'string') {
                    var mm = dh.append(dom, {cls : EXTELMASKMSG, cn:{tag:'div'}}, true);
                    data(dom, 'maskMsg', mm);
                    mm.dom.className = msgCls ? EXTELMASKMSG + " " + msgCls : EXTELMASKMSG;
                    mm.dom.firstChild.innerHTML = msg;
                    mm.setDisplayed(true);
                    mm.center(me);
                }
                
                
                if (Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && me.getStyle('height') == 'auto') {
                    mask.setSize(undefined, me.getHeight());
                }
                
                return mask;
            }

            
        };
    }()
);



Ext.namespace('Lino');
    
    

//~ Lino.subst_user_field = new Ext.form.ComboBox({});
//~ Lino.subst_user = null;
Lino.insert_subst_user = function(p){
    //~ console.log('20120714 insert_subst_user',Lino.subst_user,p);
    //~ if (Lino.subst_user_field.getValue()) {
    if (p.su) return;
    if (Lino.subst_user) {
        //~ p.su = Lino.subst_user_field.getValue();
        p.su = Lino.subst_user;
    //~ } else {
        //~ delete p.su;
    }
    //~ console.log('20120714 insert_subst_user -->',Lino.subst_user,p);
}

// Lino.login_window = null;



Lino.set_subst_user = function(id, name) {
    //~ console.log(20130723,'Lino.set_subst_user',id,name,Lino.current_window,Lino.viewport);
    Lino.subst_user = id;
    if (Lino.current_window) 
        Lino.current_window.main_item.set_base_param("su",id);
    if (Lino.viewport) 
        Lino.permalink_handler(Lino.current_window)();
}



//~ Lino.select_subst_user = function(cmp,rec,value){
    //~ Lino.subst_user=value;
    //~ console.log(20120713,rec);
//~ }
    
Lino.current_window = null;
Lino.window_history = Array();
    
Lino.chars2width = function(cols) {  return cols * 9; }
Lino.rows2height = function(cols) {  return cols * 20; }
Lino.perc2width = function(perc) {  
    // var w = Math.max(document.documentElement.clientWidth, window.innerWidth);
    // console.log("20151226", document, window, w);
    var w = Lino.viewport.getWidth();
    return w * perc / 100; 
}



Lino.MainPanel = {
  is_home_page: false
  ,auto_apply_params: true
  ,setting_param_values : false
  ,config_containing_window : function(wincfg) { }
  ,init_containing_window : function(win) { }
  ,is_loading : function() { 
      if (!this.rendered) return true;
      //~ return (Ext.select('.x-loading-msg').elements.length > 0);
      return true; 
    } 
  ,do_when_clean : function(auto_save,todo) { todo() }
  ,get_master_params : function() {
    var p = {}
    p['mt'] = this.content_type; 
    rec = this.get_current_record()
    if (rec) {
      if (rec.phantom) {
          p['mk'] = undefined; 
      }else{
          p['mk'] = rec.id; 
      }
    } else {
      p['mk'] = undefined;
    }
    //~ console.log('get_master_params returns',p,'using record',rec);
    return p;
  }
  ,get_permalink : function() {
    var p = Ext.apply({}, this.get_base_params());
    delete p.fmt;
    Ext.apply(p, this.get_permalink_params());
    
    if (this.toggle_params_panel_btn) {
        p.sp = this.toggle_params_panel_btn.pressed;
        //~ if (this.toggle_params_panel_btn.pressed == this.params_panel_hidden) {
          //~ p.sp = true;
        //~ }
    }
    
    //~ Lino.insert_subst_user(p);
     //~ p.fmt = 'html';
    //~ console.log('get_permalink',p,this.get_permalink_params());
    if (this.is_home_page)
        //~ var url = '';
        var url = '/';
    else 
        var url = this.get_permalink_url();
    if (p.su == null) 
        delete p.su;
    if (Ext.urlEncode(p)) url = url + "?" + Ext.urlEncode(p);
    return url;
  }
  ,get_record_url : function(record_id) {
      var url = '/api' + this.ls_url
      //~ var url = this.containing_window.config.url_data; // ls_url;
      url += '/' + (record_id === undefined ? this.default_record_id : String(record_id));
      //~ if (record_id !== undefined) url += '/' + String(record_id);
      //~ url += '/' + String(record_id);
      return url;
  }
  ,get_permalink_url : function() {
      return '/api' + this.ls_url;
  }
  ,get_permalink_params : function() {
      //~ return {an:'grid'};
      var p = {};
      if (this.action_name)
          p.an = this.action_name;
      this.add_param_values(p,false)
      return p;
  }
  /*

  Lino.MainPanel.set_status() : the status can have the following keys:

  - param_values : values of parameter fields
  - field_values : values of action parameter fields
  - base_params
  - record_id
  - active_tab
  - data_record
  - show_params_panel
  - current_page

   */
  ,set_status : function(status, requesting_panel) {}
  ,get_status : function() { return {}}
  ,refresh : function() {}
  ,get_base_params : function() {  // Lino.MainPanel
    var p = {};
    Lino.insert_subst_user(p);
    return p;
  }
  ,add_params_panel : function (tbar) {
      if (this.params_panel) {
        //~  20130923b
        //~ this.params_panel.autoHeight = true; // 20130924
        var t = this;
        var update = function() {
            var p = t.params_panel;
            //~ console.log("update", p.getSize().height,p.forceLayout,p.autoHeight);
            var w = t.get_containing_window();
            Lino.do_when_visible(w, function() {
                //~ p.doLayout(true); // doLayout(shallow, force)
                w.doLayout(true); // doLayout(shallow, force)
                //~ t.params_panel.on('afterlayout',update,t,{single:true});
            });
        };
        Lino.do_when_visible(this.params_panel, update);
        this.params_panel.on('show',update);
        this.params_panel.on('hide',update);
        //~ this.params_panel.on('bodyresize',update);
        this.params_panel.on('afterlayout',update);
        //~ this.params_panel.on('afterlayout',update,this,{single:true});
        //~ this.params_panel.on('bodyresize',update,this,{single:true});
        //~ this.params_panel.on('resize',update,this,{single:true});
        //~ this.params_panel.on('render',update,this,{single:true});
        
        // this.params_panel.on('render',
        //~ this.params_panel.on('afterlayout',update,this,{single:true,delay:200});
        //~ this.params_panel.on('bodyresize',update,this,{single:true,delay:200});
        this.toggle_params_panel_btn = new Ext.Button({ scope:this, 
          //~ text: "$_("[parameters]")", // gear
          iconCls: 'x-tbar-database_gear',
          tooltip:"Show or hide the table parameters panel",
          enableToggle: true,
          //~ pressed: ! this.params_panel.hidden,
          pressed: ! this.params_panel_hidden,
          toggleHandler: function(btn,state) { 
            //~ console.log("20120210 add_params_panel",state,this.params_panel);
            if (state) {
                this.params_panel.show();
            } else {
                this.params_panel.hide();
            }
            //~ this.params_panel.on('afterlayout',update,this,{single:true});
            //~ t.get_containing_window().doLayout();
            //~ this.params_panel.on('afterlayout',function() {
                //~ console.log("20130918 afterlayout");
                //~ t.get_containing_window().doLayout(); // doLayout(shallow, force)
            //~ },this,{single:true});
          }
        }); 
        tbar = tbar.concat([this.toggle_params_panel_btn]);

        if (this.auto_apply_params) {
            var refresh = function() {
                if (!t.setting_param_values) {
                    t._force_dirty = true; 
                    t.refresh();
                }
            }
            Ext.each(this.params_panel.fields,function(f) {
              //~ f.on('valid',function() {t.refresh()});
              if (f instanceof Ext.form.Checkbox) {
                  f.on('check',refresh);
              } else if (f instanceof Ext.DatePicker) {
                  f.on('select',refresh);
              } else if (f instanceof Ext.form.TriggerField) {
                  f.on('select',refresh);
                  //~ f.on('change',refresh);
                  //~ f.on('valid',refresh);
              } else {
                  if (! f.on) 
                      console.log("20121010 no method 'on'",f);
                  else
                      f.on('change',refresh);
                }
              });
        }
      }
      return tbar;
  }
  ,add_param_values : function (p,force_dirty) {
    if (this.params_panel) {
      /* 
      * 20120918 add param_values to the request string 
      * *only if the params_form is dirty*.
      * Otherwise Actor.default_params() would never be used.
      *
      * 20121023 But IntegClients.params_default has non-empty default values. 
      * Users must have the possibility to make them empty.
      * 
      * 20130605 : added `force_dirty` parameter because Checkbox fields don't 
      * mark their form as dirty when check is fired.
      * 
      * 20130721 : `force_dirty` not as a parameter but as 
      * `this._force_dirty` because
      * 
      * 20130915 : both _force_dirty and force_dirty parameter are needed.
      * 
      */
      if (force_dirty || this._force_dirty || this.params_panel.form.isDirty()) {
      //~ if (this._force_dirty || this.params_panel.form.isDirty()) {
        p.pv = this.get_param_values();
        //~ console.log("20130923 form is dirty (",force_dirty,this._force_dirty,this.params_panel.form.isDirty(),")");
        //~ console.log("20130923 form is dirty",p);
      }else{
        //~ console.log("20130923 form not dirty:",this.params_panel.form);
        if (this.status_param_values) 
          p.pv = Lino.fields2array(
            this.params_panel.fields,this.status_param_values);
      }
      //~ if (!this.params_panel.form.isDirty()) return;
      //~ p.pv = this.get_param_values();
      //~ console.log("20120203 add_param_values added pv",p.pv,"to",p);
    }
  },
  get_param_values : function() { // similar to get_field_values()
      return Lino.fields2array(this.params_panel.fields);
  },
  set_param_values : function(pv) {
    if (this.params_panel) {
      //~ console.log('20120203 MainPanel.set_param_values', pv);
      this.status_param_values = pv;
      //~ this.params_panel.form.suspendEvents(false);
      this.setting_param_values = true;
      if (pv) { 
          this.params_panel.form.my_loadRecord(pv);
      } else { 
        this.params_panel.form.reset(); 
      }
      this.setting_param_values = false;
      this._force_dirty = false; 
      //~ this.params_panel.form.resumeEvents();
    }
  }
};




Lino.Viewport = Ext.extend(Ext.Viewport, Lino.MainPanel);
Lino.Viewport = Ext.extend(Lino.Viewport, {
  layout : "fit"
  ,is_home_page : true
  ,initComponent : function(){
    Lino.Viewport.superclass.initComponent.call(this);
    this.on('render',function(){
      this.loadMask = new Ext.LoadMask(this.el,{msg:"Please wait..."});
      //~ console.log("20121118 Lino.viewport.loadMask",this.loadMask);
    },this);
  }
  ,refresh : function() {
      var caller = this;
      // console.log("20140829 Lino.Viewport.refresh()");
      if (caller.loadMask) caller.loadMask.show();
      var success = function(response) {
        if (caller.loadMask) caller.loadMask.hide();
        if (response.responseText) {
          var result = Ext.decode(response.responseText);
          //~ console.log('Lino.do_action()',action.name,'result is',result);
          if (result.html) {
              var cmp = Ext.getCmp('dashboard');
              // cmp.removeAll(true);  // 20140829
              cmp.update(result.html, true);
          }
          if (result.message) {
              if (result.alert) {
                  //~ Ext.MessageBox.alert('Alert',result.alert_msg);
                  Ext.MessageBox.alert('Alert',result.message);
              } else {
                  Lino.notify(result.message);
              }
          }
          
          if (result.notify_msg) Lino.notify(result.notify_msg);
          if (result.js_code) { 
            var jsr = result.js_code(caller);
            //~ console.log('Lino.do_action()',action,'returned from js_code in',result);
          };
        }
      };
      var action = {
        url : '/api/main_html',
        waitMsg: "Please wait...",
        failure: Lino.ajax_error_handler(caller),
        success: success,
        method: 'GET',
        params: {}
      };
      Lino.insert_subst_user(action.params);
      Ext.Ajax.request(action);
    
  }
});




Lino.open_window = function(win, st, requesting_panel) {
  // console.log("20140831 Lino.open_window()", win, win.el.getBox());
  var cw = Lino.current_window;
  if (cw) {
    // console.log("20140829 Lino.open_window() save current status",
    //             cw.main_item.get_status());
    Lino.window_history.push({
      window:cw,
      status:cw.main_item.get_status()
    });
  }
  Lino.current_window = win;
  //~ if (st.su) 
      //~ Lino.subst_user_field.setValue(st.su);
  win.main_item.set_status(st, requesting_panel);
  // win.toFront();
  win.show();
};

Lino.load_url = function(url) {
    //~ foo.bar.baz = 2; 
    //~ console.log("20121120 Lino.load_url()");
    //~ Lino.body_loadMask.show();
    Lino.viewport.loadMask.show();
    //~ location.replace(url);
    document.location = url;
}

Lino.close_window = function(status_update, norestore) {
  // norestore is used when called by handle_action_result() who 
  // will call set_status itself later
  var cw = Lino.current_window;
  var ww = Lino.window_history.pop();
  var retval = cw.main_item.requesting_panel;
  // console.log(
  //     "20150514 Lino.close_window() going to close", cw.title,
  //     "previous is", ww, 
  //     "norestore is", norestore,
  //     "retval is", retval);
  if (ww) {
    //~ if (status_update) Ext.apply(ww.status,status_update);
    if(!norestore) {
        if (status_update) status_update(ww);
        ww.window.main_item.set_status(ww.status , cw.id);
    }
    Lino.current_window = ww.window;
  } else {
      Lino.current_window = null;
      // new since 20140829:
      if(!norestore) { Lino.viewport.refresh(); }
  }
  if (cw) cw.hide_really();
  return retval;
};

Lino.kill_current_window = function() {
  // console.log("20140418 Lino.kill_current_window()");
  var cw = Lino.current_window;
  Lino.current_window = null;
  if (cw) cw.hide_really();
};

Lino.reload = function() {
    // First close all windows to ensure all changes are saved
    Lino.close_all_windows();

    // Then reload current view
    var url =  "/"

    var p = {};
    Lino.insert_subst_user(p)
    if (Ext.urlEncode(p))
        url = url + "?" + Ext.urlEncode(p);

    Lino.load_url(url);
}

Lino.handle_home_button = function() {
  if (Lino.window_history.length == 0)
      Lino.reload();
  else
      Lino.close_all_windows();
}

Lino.close_all_windows = function() {
    while (Lino.window_history.length > 0) {
        Lino.close_window();
    }
}

Lino.calling_window = function() {
    if (Lino.window_history.length) 
        return Lino.window_history[Lino.window_history.length-1];
}

//~ Lino.WindowAction = function(mainItemClass,windowConfig,mainConfig,ppf) {
Lino.WindowAction = function(windowConfig,main_item_fn) {
    //~ if(!mainConfig) mainConfig = {};
    //~ mainConfig.is_main_window = true;
    this.windowConfig = windowConfig;
    this.main_item_fn = main_item_fn;
    //~ if (ppf) mainConfig.params_panel.fields = ppf;
    //~ this.mainConfig = mainConfig;
    //~ this.mainItemClass = mainItemClass;
};

Lino.WindowAction = Ext.extend(Lino.WindowAction,{
    window : null,
    //~ mainItemClass: null,
    get_window : function() {
      //~ if(mainConfig) Ext.apply(this.mainConfig,mainConfig);
      // if (this.window == null || this.window.isDestroyed)  { // 20140829
      // if (this.window == null || this.window.getBox().width == 0)  { // 20140829
      if (this.window == null)  {
      // if (true)  {
          //~ this.windowConfig.main_item = new this.mainItemClass(this.mainConfig);
          this.windowConfig.main_item = this.main_item_fn();
          this.window = new Lino.Window(this.windowConfig);
      }
      return this.window;
    },
    run : function(requesting_panel, status) {
      // console.log('20140829 window_action.run()', this)
      Lino.open_window(this.get_window(), status, requesting_panel);
    }
  
});


Lino.PanelMixin = {
  get_containing_window : function (){
      if (this.containing_window) return this.containing_window;
      return this.containing_panel.get_containing_window();
  }
  ,set_window_title : function(title) {
    //~ this.setTitle(title);
    var cw = this.get_containing_window();

    //~ if (cw) {
    //~ if (cw && cw.closable) {
    if (cw && !cw.main_item.hide_window_title) {
      //~ console.log('20111202 set_window_title(',title,') for',this.containing_window);
      //~ if (! this.containing_window.rendered) console.log("WARNING: not rendered!");
      cw.setTitle(title);
    //~ } else {
      //~ document.title = title;
    }
    //~ else console.log('20111202 not set_window_title(',title,') for',this);
  }
  
};


// Lino.status_bar = new Ext.ux.StatusBar({defaultText:'Lino version 18.3.0.'});






/* 
  Originally copied from Ext JS Library 3.3.1
  Modifications by Luc Saffre : 
  - rendering of phantom records
  - fire afteredit event
  - react on dblclcik, not on single click

 */
Lino.CheckColumn = Ext.extend(Ext.grid.Column, {

    processEvent : function(name, e, grid, rowIndex, colIndex){
        //~ console.log('20110713 Lino.CheckColumn.processEvent',name)
        if (name == 'click') {
        //~ if (name == 'mousedown') {
        //~ if (name == 'dblclick') {
            return this.toggleValue(grid, rowIndex, colIndex);
        } else {
            return Ext.grid.ActionColumn.superclass.processEvent.apply(this, arguments);
        }
    },
    
    toggleValue : function (grid,rowIndex,colIndex) {
        var record = grid.store.getAt(rowIndex);
        var dataIndex = grid.colModel.getDataIndex(colIndex);
        // 20120514
        //~ if(record.data.disabled_fields && record.data.disabled_fields[dataIndex]) {
          //~ Lino.notify("This field is disabled");
          //~ return false;
        //~ }
      
        //~ if (dataIndex in record.data['disabled_fields']) {
            //~ Lino.notify("This field is disabled.");
            //~ return false;
        //~ }
        var startValue = record.data[dataIndex];
        var value = !startValue;
        //~ record.set(this.dataIndex, value);
        var e = {
            grid: grid,
            record: record,
            field: dataIndex,
            originalValue: startValue,
            value: value,
            row: rowIndex,
            column: colIndex,
            cancel: false
        };
        if(grid.fireEvent("beforeedit", e) !== false && !e.cancel){
        //~ if(grid.fireEvent("validateedit", e) !== false && !e.cancel){
            record.set(dataIndex, value);
            delete e.cancel;
            grid.fireEvent("afteredit", e);
        }
        return false; // Cancel event propagation
    },

    renderer : function(v, p, record){
        if (record.phantom) return '';
        p.css += ' x-grid3-check-col-td'; 
        return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', v ? '-on' : '');
    }

    // Deprecate use as a plugin. Remove in 4.0
    // init: Ext.emptyFn
});

// register ptype. Deprecate. Remove in 4.0
// Ext.preg('checkcolumn', Lino.CheckColumn);

// backwards compat. Remove in 4.0
// Ext.grid.CheckColumn = Lino.CheckColumn;

// register Column xtype
Ext.grid.Column.types.checkcolumn = Lino.CheckColumn;


/* 20110725 : 
Lino.on_tab_activate is necessary 
in contacts.Person.2.dtl 
(but don't ask me why...)
*/
Lino.on_tab_activate = function(item) {
  //~ console.log('activate',item); 
  if (item.rendered && item.doLayout) item.doLayout();
  //~ if (item.rendered) item.doLayout();
}

Lino.TimeField = Ext.extend(Ext.form.TimeField,{
  format: 'H:i',
  altFormats: 'g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H|gi a|hi a|giA|hiA|gi A|hi A|Hi|g.ia|g.iA|g.i a|g.i A|h.i|g.i|H.i',
  increment: 15
  });
Lino.DateField = Ext.extend(Ext.form.DateField,{
  //~ boxMinWidth: Lino.chars2width(15), // 20131005 changed from 11 to 15
  format: 'd.m.Y',
  altFormats: 'd/m/Y|Y-m-d'
  });
Lino.DatePickerField = Ext.extend(Ext.DatePicker,{
  //~ boxMinWidth: Lino.chars2width(11),
  format: 'd.m.Y',
  //~ altFormats: 'd/m/Y|Y-m-d'
  formatDate : function(date){
      //~ console.log("20121203 formatDate",this.name,date);
      return Ext.isDate(date) ? date.dateFormat(this.format) : date;
  }
  });
Lino.DateTimeField = Ext.extend(Ext.ux.form.DateTime,{
  dateFormat: 'd.m.Y',
  timeFormat: 'H:i'
  //~ ,hiddenFormat: 'd.m.Y H:i'
  });
Lino.URLField = Ext.extend(Ext.form.TriggerField,{
  triggerClass : 'x-form-search-trigger',
  //~ triggerClass : 'x-form-world-trigger',
  vtype: 'url',
  onTriggerClick : function() {
    //~ console.log('Lino.URLField.onTriggerClick',this.value)
    //~ document.location = this.value;
    window.open(this.getValue(),'_blank');
  }
});
Lino.IncompleteDateField = Ext.extend(Ext.form.TextField,{
  //~ regex: /^-?\d+-[01]\d-[0123]\d$/,
  //~ regex: /^[0123]\d\.[01]\d\.-?\d+$/,
  maxLength: 10,
  boxMinWidth: Lino.chars2width(10),
  regex: /^[0123]?\d\.[01]?\d\.-?\d+$/,
  regexText: 'Enter a date in format YYYY-MM-DD (use zeroes for unknown parts).'
  });


//~ Lino.make_dropzone = function(cmp) {
    //~ cmp.on('render', function(ct, position){
      //~ ct.el.on({
        //~ dragenter:function(event){
          //~ event.browserEvent.dataTransfer.dropEffect = 'move';
          //~ return true;
        //~ }
        //~ ,dragover:function(event){
          //~ event.browserEvent.dataTransfer.dropEffect = 'move';
          //~ event.stopEvent();
          //~ return true;
        //~ }
        //~ ,drop:{
          //~ scope:this
          //~ ,fn:function(event){
            //~ event.stopEvent();
            //~ console.log(20110516);
            //~ var files = event.browserEvent.dataTransfer.files;
            //~ if(files === undefined){
              //~ return true;
            //~ }
            //~ var len = files.length;
            //~ while(--len >= 0){
              //~ console.log(files[len]);
              //~ // this.processDragAndDropFileUpload(files[len]);
            //~ }
          //~ }
        //~ }
      //~ });
    //~ });
//~ };

//~ Lino.FileUploadField = Ext.ux.form.FileUploadField;

Lino.FileUploadField = Ext.extend(Ext.ux.form.FileUploadField,{
    unused_onRender : function(ct, position){
      Lino.FileUploadField.superclass.onRender.call(this, ct, position);
      this.el.on({
        dragenter:function(event){
          event.browserEvent.dataTransfer.dropEffect = 'move';
          return true;
        }
        ,dragover:function(event){
          event.browserEvent.dataTransfer.dropEffect = 'move';
          event.stopEvent();
          return true;
        }
        ,drop:{
          scope:this
          ,fn:function(event){
            event.stopEvent();
            //~ console.log(20110516);
            var files = event.browserEvent.dataTransfer.files;
            if(files === undefined){
              return true;
            }
            var len = files.length;
            while(--len >= 0){
              console.log(files[len]);
              //~ this.processDragAndDropFileUpload(files[len]);
            }
          }
        }
      });
    }
});

Lino.FileField = Ext.extend(Ext.form.TriggerField,{
  triggerClass : 'x-form-search-trigger',
  editable: false,
  onTriggerClick : function() {
    //~ console.log('Lino.URLField.onTriggerClick',this.value)
    //~ document.location = this.value;
    if (this.getValue()) window.open(MEDIA_URL + '/'+this.getValue(),'_blank');
  }
});

Lino.file_field_handler = function(panel,config) {
  if (panel.action_name == 'insert') {
      panel.has_file_upload = true;


      // config.value = '<br/><br/>';

      var f = new Lino.FileUploadField(config);
      //~ Lino.make_dropzone(f);
      return f;
      //~ return new Ext.ux.form.FileUploadField(config);
      //~ return new Lino.FileField(config);
      
  } else {
      //~ return new Lino.URLField(config);
      return new Lino.FileField(config);
  }
}

Lino.VBorderPanel = Ext.extend(Ext.Panel,{
    constructor : function(config) {
      config.layout = 'border';
      delete config.layoutConfig;
      Lino.VBorderPanel.superclass.constructor.call(this,config);
      for(var i=0; i < this.items.length;i++) {
        var item = this.items.get(i);
        if (this.isVertical(item) && item.collapsible) {
          item.on('collapse',this.onBodyResize,this);
          item.on('expand',this.onBodyResize,this);
        }
      }
    },
    isVertical : function(item) {
       return (item.region == 'north' || item.region == 'south' || item.region == 'center');
    },
    onBodyResize: function(w, h){
        //~ console.log('VBorderPanel.onBodyResize',this.title)
      if (this.isVisible()) { // to avoid "Uncaught TypeError: Cannot call method 'getHeight' of undefined."
        var sumflex = 0;
        var availableHeight = this.getInnerHeight();
        var me = this;
        this.items.each(function(item){
          if (me.isVertical(item)) {
              if (item.collapsed || item.flex == 0 || item.flex === undefined) {
                  if (item.rendered) availableHeight -= item.getHeight();
              } else {
                  sumflex += item.flex;
              }
          } 
          
        });
        //~ for(var i=0; i < this.items.length;i++) {
          //~ var item = this.items.get(i);
          //~ // if (this.isVertical(item) && item.getResizeEl()) {
          //~ if (this.isVertical(item)) {
              //~ if (item.collapsed || item.flex == 0 || item.flex === undefined) {
                  //~ // item.syncSize()
                  //~ // item.doLayout()
                  //~ // if (item.region == "north") console.log('region north',item.getHeight(),item.id, item);
                  //~ // if (item.getHeight() == 0) console.log(20100921,'both flex and getHeight() are 0!');
                  //~ availableHeight -= item.getHeight();
              //~ } else {
                  //~ sumflex += item.flex;
                  //~ // console.log(item.flex);
              //~ }
          //~ } 
          //~ // else console.log('non-vertical item in VBoderPanel:',item)
        //~ }
        var hunit = availableHeight / sumflex;
        //~ console.log('sumflex=',sumflex,'hunit=',hunit, 'availableHeight=',availableHeight);
        for(var i=0; i < this.items.length;i++) {
          var item = this.items.get(i);
          if (this.isVertical(item)) {
              if (item.flex != 0 && ! item.collapsed) {
                  item.setHeight(hunit * item.flex);
                  //~ console.log(item.region,' : height set to',item.getHeight());
              }
          }
          //~ else console.log('non-vertical item in VBoderPanel:',item)
        }
      }
      Lino.VBorderPanel.superclass.onBodyResize.call(this, w, h);
    }
});


/*
  modifications to the standard behaviour of a CellSelectionModel:
  
*/
Ext.override(Ext.grid.CellSelectionModel, {
//~ var dummy = {

    handleKeyDown : function(e){
        /* removed because F2 wouldn't pass
        if(!e.isNavKeyPress()){
            return;
        }
        */
        //~ console.log('handleKeyDown',e)
        var k = e.getKey(),
            g = this.grid,
            s = this.selection,
            sm = this,
            walk = function(row, col, step){
                return g.walkCells(
                    row,
                    col,
                    step,
                    g.isEditor && g.editing ? sm.acceptsNav : sm.isSelectable, 
                    sm
                );
            },
            cell, newCell, r, c, ae;

        switch(k){
            case e.ESC:
            case e.PAGE_UP:
            case e.PAGE_DOWN:
                break;
            default:
                // e.stopEvent(); // removed because Browser keys like Alt-Home, Ctrl-R wouldn't work
                break;
        }

        if(!s){
            cell = walk(0, 0, 1); 
            if(cell){
                this.select(cell[0], cell[1]);
            }
            return;
        }

        cell = s.cell;
        r = cell[0];    
        c = cell[1];    
        
        switch(k){
            case e.TAB:
                if(e.shiftKey){
                    newCell = walk(r, c - 1, -1);
                }else{
                    newCell = walk(r, c + 1, 1);
                }
                break;
            case e.HOME:
                if (! (g.isEditor && g.editing)) {
                  if (!e.hasModifier()){
                      newCell = [r, 0];
                      //~ console.log('home',newCell);
                      break;
                  }else if(e.ctrlKey){
                      var t = g.getTopToolbar();
                      var activePage = Math.ceil((t.cursor + t.pageSize) / t.pageSize);
                      if (activePage > 1) {
                          e.stopEvent();
                          t.moveFirst();
                          return;
                      }
                      newCell = [0, c];
                      break;
                  }
                }
            case e.END:
                if (! (g.isEditor && g.editing)) {
                  c = g.colModel.getColumnCount()-1;
                  if (!e.hasModifier()) {
                      newCell = [r, c];
                      //~ console.log('end',newCell);
                      break;
                  }else if(e.ctrlKey){
                      var t = g.getTopToolbar();
                      var d = t.getPageData();
                      if (d.activePage < d.pages) {
                          e.stopEvent();
                          var self = this;
                          t.on('change',function(tb,pageData) {
                              var r = g.store.getCount()-2;
                              self.select(r, c);
                              //~ console.log('change',r,c);
                          },this,{single:true});
                          t.moveLast();
                          return;
                      } else {
                          newCell = [g.store.getCount()-1, c];
                          //~ console.log('ctrl-end',newCell);
                          break;
                      }
                  }
                }
            case e.DOWN:
                newCell = walk(r + 1, c, 1);
                break;
            case e.UP:
                newCell = walk(r - 1, c, -1);
                break;
            case e.RIGHT:
                newCell = walk(r, c + 1, 1);
                break;
            case e.LEFT:
                newCell = walk(r, c - 1, -1);
                break;
            case e.F2:
                if (!e.hasModifier()) {
                    if (g.isEditor && !g.editing) {
                        g.startEditing(r, c);
                        e.stopEvent();
                        return;
                    }
                    break;
                }
            case e.INSERT:
                if (!e.hasModifier()) {
                    if (g.ls_insert_handler && !g.editing) {
                        e.stopEvent();
                        Lino.show_insert(g);
                        return;
                    }
                    break;
                }
            // case e.DELETE:
            //     if (!e.hasModifier()) {
            //         if (!g.editing) {
            //             e.stopEvent();
            //             Lino.delete_selected(g);
            //             return;
            //         }
            //         break;
            //     }

            case e.ENTER:
                e.stopEvent();
                g.onCellDblClick(r,c);
                break;

            default:
                g.handle_key_event(e);
                
        }
        

        if(newCell){
          e.stopEvent();
          r = newCell[0];
          c = newCell[1];
          this.select(r, c); 
          if(g.isEditor && g.editing){ 
            ae = g.activeEditor;
            if(ae && ae.field.triggerBlur){
                ae.field.triggerBlur();
            }
            g.startEditing(r, c);
          }
        //~ } else if (g.isEditor && !g.editing && e.charCode) {
        //~ // } else if (!e.isSpecialKey() && g.isEditor && !g.editing) {
            //~ g.set_start_value(String.fromCharCode(e.charCode));
            //~ // g.set_start_value(String.fromCharCode(k));
            //~ // g.set_start_value(e.charCode);
            //~ g.startEditing(r, c);
            //~ // e.stopEvent();
            //~ return;
        // } else {
          // console.log('20120513',e,g);
        }
        
    }


//~ };
});

 

function PseudoConsole() {
    this.log = function() {};
};
if (typeof(console) == 'undefined') console = new PseudoConsole();

Lino.notify = function(msg) {
  if (msg == undefined) msg = ''; else console.log(msg);
  
    if (msg == undefined) return;
    // Lino.alert(msg);
  
};

Lino.alert = function(msg) {
  Ext.MessageBox.alert('Notify',msg);
};


//~ Lino.show_about = function() {
  //~ new Ext.Window({
    //~ width: 400, height: 400,
    //~ title: "About",
    //~ html: '<a href="http://www.extjs.com" target="_blank">ExtJS</a> version ' + Ext.version
  //~ }).show();
//~ };

function obj2str(o) {
  if (typeof o != 'object') return String(o);
  var s = '';
  for (var p in o) {
    s += p + ': ' + obj2str(o[p]) + '\n';
  }
  return s;
}

Lino.on_store_exception = function (store,type,action,options,response,arg) {
  //~ throw response;
  console.log("on_store_exception: store=",store,
    "type=",type,
    "action=",action,
    "options=",options,
    "response=",response,
    "arg=",arg);
    if (arg != undefined && arg) { console.log(arg.stack)};
    var msg = "There was a problem with the database connection.";
    if (response.responseText)
        msg += '<br/>' + response.responseText
    msg += '<br/>' + "If the error persists, try reloading the browser page ([SHIFT+CTRL+R] in Firefox)."
    Ext.Msg.alert("Database problem", msg );
    
};

//~ Lino.on_submit_success = function(form, action) {
   //~ Lino.notify(action.result.message);
   //~ this.close();
//~ };

Lino.on_submit_failure = function(form, action) {
    //~ Lino.notify();
  // action may be undefined
    switch (action.failureType) {
        case Ext.form.Action.CLIENT_INVALID:
            Ext.Msg.alert('Client-side failure', 'Form fields may not be submitted with invalid values');
            break;
        case Ext.form.Action.CONNECT_FAILURE:
            Ext.Msg.alert('Connection failure', 'Ajax communication failed');
            break;
        case Ext.form.Action.SERVER_INVALID:
            Ext.Msg.alert('Server-side failure', action.result.message);
   }
};



/*
Lino.save_wc_handler = function(ww) {
  return function(event,toolEl,panel,tc) {
    var pos = panel.getPosition();
    var size = panel.getSize();
    wc = ww.get_window_config();
    Ext.applyIf(wc,{ 
      x:pos[0],y:pos[1],height:size.height,width:size.width,
      maximized:panel.maximized});
    Lino.do_action(ww,{url:'/window_configs/'+ww.config.permalink_name,params:wc,method:'POST'});
  }
};

*/

Lino.show_in_own_window_button = function(handler) {
  return {
    qtip: "Show this panel in own window", 
    id: "up",
    handler: function(event,toolEl,panel, tc) {
      //~ console.log('20111206 report_window_button',panel,handler);
      handler.run(null,{base_params:panel.containing_panel.get_master_params()});
    }
  }
}

Lino.action_handler = function (panel, on_success, on_confirm) {
  return function (response) {
      if (!panel) { 
          if (Lino.current_window) 
              panel = Lino.current_window.main_item;
          else panel = Lino.viewport;
      }
      
    if (panel.loadMask) panel.loadMask.hide(); // 20120211
    if (!response.responseText) return ;
    var result = Ext.decode(response.responseText);
    Lino.handle_action_result(panel, result, on_success, on_confirm);
  }
};

Lino.handle_action_result = function (panel, result, on_success, on_confirm) {

    // console.log('20150514 Lino.handle_action_result()', result);
    
    // if (panel instanceof Lino.GridPanel) {
    //     gridmode = true;
    // } else {
    //     gridmode = false;
    // }

    //~ if (result.goto_record) {
        //~ var js = "Lino." + result.goto_record[0] + '.detail.run';
        //~ var h = eval(js);
        //~ h(panel,{record_id:result.goto_record[1]});
    //~ }
    
    if (result.goto_url) {
        document.location = result.goto_url;
        if (result.close_window) Lino.close_window();
        return;
    }
    
    if (result.xcallback) {
        //~ var config = {title:"Confirmation"};
        var config = {title:result.xcallback.title};
        //~ config.buttons = Ext.MessageBox.YESNOCANCEL;
        //~ config.buttons = Ext.MessageBox.YESNO;
        var p = {};
        Lino.insert_subst_user(p);
        config.buttons = result.xcallback.buttons;
        config.msg = result.message;
        config.fn = function(buttonId, text, opt) {
          panel.loadMask.show(); 
          //~ Lino.insert_subst_user(p);
          Ext.Ajax.request({
            method: 'GET',
            url: '/callbacks/'
                  + result.xcallback.id + '/' + buttonId,
            params: p,
            failure: Lino.ajax_error_handler(panel),
            success: Lino.action_handler(panel, on_success, on_confirm)
          });
        }
        Ext.MessageBox.show(config);
        return;
    }

    // `record_id` and/or `data_record` both mean "display the detail
    // of this record". 
    
    if(result.detail_handler_name) {
        // TODO: make sure that result.detail_handler_name is secure
        var detail_handler = eval("Lino." + result.detail_handler_name);
    }
    var ns = {};  // new status
    if (result.close_window) {
        
        // Subsequent processing expects that `panel` is "the current
        // panel". But if we close the window, `panel` must point
        // to the previous window. Note the case of an insert window
        // that has been invoked by double-clicking on the phantom row
        // of a slave table in a detail window. In that case we want
        // `panel` to become the grid panel of the slave table who
        // called the insert window, not the master's detail form
        // panel.  When the insert window has been called by an action
        // link (e.g. generated using ar.insert_button), then
        // Lino.close_window can return `undefined`.

        if(result.record_id || result.data_record) {
            var ww = Lino.calling_window();
            if (ww && ww.window.main_item instanceof Lino.FormPanel) {
                if (ww.window.main_item.ls_detail_handler == detail_handler) {
                    ns.record_id = result.record_id;
                    ns.data_record = result.data_record;
                    // console.log("20150514 use new status.");
                }
            }
        }

        panel = Lino.close_window(
            function(ww) { Ext.apply(ww.status, ns) }); 
        if (!panel) 
            // console.log("20150514 close_window returned no panel.");
            if (Lino.current_window)
                panel = Lino.current_window.main_item;

    }

    if(result.record_id || result.data_record) {
        if (! (ns.record_id || ns.data_record)) {
          // no close_window, so we must update record data in current
          // panel (if it is the detail_handler for this record) or
          // open the detail handler.
          var st = {
              record_id: result.record_id,
              data_record: result.data_record
          };
          if (result.active_tab) st.active_tab = result.active_tab;
          if (panel instanceof Lino.FormPanel 
              && panel.ls_detail_handler == detail_handler) 
            {
              // console.log("20150514 use panel.set_status().");
              panel.set_status(st);
          } else {
              // console.log("20150514 run detail_handler.");
              if (panel.ls_detail_handler == detail_handler){st.base_params = panel.get_base_params();}
              detail_handler.run(null, st);
          }

          // if (panel instanceof Lino.FormPanel 
          //     && panel.ls_url == result.actor_url) {
          //     // console.log("20140506 case 2 it's a FormPanel:", panel);
          //     panel.set_status({
          //         record_id: result.record_id,
          //         data_record: result.data_record});
          // } else if (panel.ls_detail_handler 
          //            && panel.ls_url == result.actor_url) {
          //     // console.log("20140506 case 4");
          //     panel.ls_detail_handler.run(null, {
          //         record_id: result.record_id,
          //         data_record: result.data_record,
          //         base_params: panel.get_base_params()});
          // } else {
          //     result.refresh_all = true;
          //     console.log("20140604 case 6", result.actor_url);
          // }
        }
    }

    // `eval_js` must get handled after `close_window` because it
    // might ask to open a new window (and we don't want to close that
    // new window).  It must execute *before* any MessageBox,
    // otherwise the box would get hidden by a window that opens
    // afterwards.

    if (result.eval_js) {
        //~ console.log(20120618,result.eval_js);
        eval(result.eval_js);
    }
    
    if (on_success && result.success) {
        // console.log("20140430 handle_action_result calls on_success", 
        //             on_success);
        on_success(result);
    }
    
    if (result.info_message) {
        console.log(result.info_message);
    }
    
    if (result.warning_message) {
        if (!result.alert) result.alert = "Warning";
        Ext.MessageBox.alert(result.alert, result.warning_message);
    }
    
    if (result.message) {
        //~ if (result.alert && ! gridmode) {
        if (result.alert) { // 20120628b 
            //~ Ext.MessageBox.alert('Alert',result.alert_msg);
            if (result.alert === true) result.alert = "Alert";
            Ext.MessageBox.alert(result.alert, result.message);
        } else {
            Lino.notify(result.message);
        }
    }

    if(result.record_deleted && panel.ls_detail_handler == detail_handler) {
        panel.after_delete();
    }
    
    if (result.refresh_all) {
        var cw = Lino.current_window;
        // var cw = panel.get_containing_window();
        if (cw) {
            // console.log("20140917 refresh_all calls refresh on", cw.main_item);
            cw.main_item.refresh();
        } else { Lino.viewport.refresh(); }
        // else console.log("20140917 cannot refresh_all because ",
        //                  "there is no current_window");
    } else {
        if (result.refresh) {
            // console.log("20140917 Gonna call panel.refresh()", panel);
            panel.refresh();
        }
    }if (result.open_url) {
        //~ console.log(20111126,result.open_url);
        //~ if (!result.message)
            //~ Lino.notify('Open new window <a href="'+result.open_url+'" target="_blank">'+result.open_url+'</a>');
        window.open(result.open_url,'foo',"");
        //~ document.location = result.open_url;
    }
};

// obsolete but still used for deleting records.
Lino.do_action = function(caller,action) { 
  action.success = function(response) {
    if (caller.loadMask) caller.loadMask.hide();
    //~ console.log('Lino.do_action()',action,'action success',response);
    if (action.after_success) {
        //~ console.log('Lino.do_action() calling after_success');
        action.after_success();
    }
    if (response.responseText) {
      var result = Ext.decode(response.responseText);
      //~ console.log('Lino.do_action()',action.name,'result is',result);
      if (result.message) {
          if (result.alert) {
              //~ Ext.MessageBox.alert('Alert',result.alert_msg);
              Ext.MessageBox.alert('Alert',result.message);
          } else {
              Lino.notify(result.message);
          }
      }
      
      //~ if (result.alert_msg) Ext.MessageBox.alert('Alert',result.alert_msg);
      //~ if (result.message) Lino.notify(result.message);
      if (result.notify_msg) Lino.notify(result.notify_msg);
      if (result.js_code) { 
        //~ console.log('Lino.do_action()',action,'gonna call js_code in',result);
        var jsr = result.js_code(caller);
        //~ console.log('Lino.do_action()',action,'returned from js_code in',result);
        if (action.after_js_code) {
          //~ console.log('Lino.do_action()',action,'gonna call after_js_code');
          action.after_js_code(jsr);
          //~ console.log('Lino.do_action()',action,'returned from after_js_code');
        //~ } else {
          //~ console.log('Lino.do_action()',action,' : after_js_code is false');
        }
      };
    }
  };
  Ext.applyIf(action,{
    waitMsg: "Please wait...",
    failure: Lino.ajax_error_handler(caller),
    params: {}
  });
  //~ action.params.su = Lino.subst_user;
  Lino.insert_subst_user(action.params);
  
  Ext.Ajax.request(action);
};

//~ Lino.gup = function( name )
//~ {
  //~ // Thanks to http://www.netlobo.com/url_query_string_javascript.html
  //~ name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  //~ var regexS = "[\\?&]"+name+"=([^&#]*)";
  //~ var regex = new RegExp( regexS );
  //~ var results = regex.exec( window.location.href );
  //~ if( results == null )
    //~ return "";
  //~ else
    //~ return results[1];
//~ };

//~ Lino.refresh_handler = function (ww) {
  //~ return function() { 
      //~ console.log('refresh',ww);
      //~ ww.main_item.doLayout(false,true);
      //~ ww.main_item.syncSize();
  //~ }
//~ };

//~ Lino.tools_close_handler = function (ww) {
  //~ return function() { 
      //~ ww.close();
  //~ }
//~ };
Lino.permalink_handler = function (ww) {
  return function() { 
    //~ document.location = ww.main_item.get_permalink();
    //~ console.log('20130723 Lino.permalink_handler',ww);
    
    /* Uncaught TypeError: Cannot read property 'main_item' of null  */
    if (ww) {
        var url = ww.main_item.get_permalink();
    } else {
        var url = Lino.viewport.get_permalink();
    }
    Lino.load_url(url);
  }
};
//~ Lino.run_permalink = function() {
  //~ var plink = Lino.gup('permalink');
  //~ if(plink) { eval('Lino.'+plink); }
//~ }


Lino.ajax_error_handler = function(panel) {
  return function(response,options) {
    console.log('Ajax failure:', response, options);
    if (panel.loadMask) panel.loadMask.hide();
    if (response.responseText) {
      var lines = response.responseText.split('\n');
      if (lines.length > 10) {
          line = lines.splice(5, lines.length-10, "(...)");
      }
      //~ console.log(20131005, response.statusText.toCamel());
      Ext.MessageBox.alert(
        response.statusText.toCamel(),
        lines.join('<br/>')
        //~ response.responseText.replace(/\n/g,'<br/>'))
      )
    } else {
      Ext.MessageBox.alert('Action failed',
        'Lino server did not respond to Ajax request');
    }
  }
}
// Ext.Ajax.on('requestexception',Lino.ajax_error_handler)
 


Ext.QuickTips.init();

/* setting QuickTips dismissDelay to 0 */
// Apply a set of config properties to the singleton
//~ Ext.apply(Ext.QuickTips.getQuickTip(), {
//~ Ext.apply(Ext.ToolTip, {
    //~ dismissDelay: 0
    //~ autoHide: false,
    //~ closable: true,
    //~ maxWidth: 200,
    //~ minWidth: 100,
    //~ showDelay: 50      // Show 50ms after entering target
    //~ ,trackMouse: true
//~ });


// Ext.apply(Ext.QuickTips.getQuickTip(), {
//     dismissDelay: 500,
//     showDelay: 20      // Show 10ms after entering target
// });
  
Lino.quicktip_renderer = function(title, body) {
  return function(c) {
    //~ if (c instanceof Ext.Panel) var t = c.bwrap; else // 20130129
      if (c instanceof Ext.Panel) {
          var t = c.header;
      } else if (c instanceof Ext.Button) {
          var t = c.btnEl;
      } else  {
          var t = c.getEl();
      }
    // console.log(20171024, c, t, body);
    //~ t.dismissDelay = 0;
    Ext.QuickTips.register({
      target: t,
      //~ cls: 'lino-quicktip-classical',
      dismissDelay: 10000,
      //~ autoHide: false,
      showDelay: 30,      // Show X ms after entering target
      //~ title: title,
      text: body
    });
  }
};


  
Lino.help_text_editor = function() {
  //~ var bp = {
      //~ mk:this.content_type,
      //~ mt:1
    //~ };
    //~ console.log(20120202,bp);
  //~ Lino.lino.ContentTypes.detail({},{base_params:bp});
  //~ Lino.lino.ContentTypes.detail.run(null,{record_id:this.content_type});
  Lino.lino.ContentTypes.detail.run(null,{record_id:this.content_type});
}

// Path to the blank image should point to a valid location on your server
//~ Ext.BLANK_IMAGE_URL = MEDIA_URL + '/extjs/resources/images/default/s.gif'; 


// used as Ext.grid.Column.renderer for id columns in order to hide the special id value -99999
Lino.id_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  //~ if (record.phantom) return '';
  return value;
}

Lino.raw_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  return value;
}

Lino.text_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  //~ return "not implemented"; 
  return value;
}

Lino.NullNumberColumn = Ext.extend(Ext.grid.Column, {
    align : 'right', 
    format : '0,000.00/i', 
    renderer : function(value, metaData, record, rowIndex, colIndex, store) {
        // if( colIndex == 3)
        //     console.log(20130128,"NullNumberColumn.renderer",value);
        if (value === null) return '';
        return Ext.util.Format.number(value, this.format);
    }
});


Lino.link_button = function(url) {
    // return '<a href="' + url + '"><img src="/media/lino/extjs/images/xsite/link.png" alt="link_button"></a>'
    return '<a href="' + url + '" style="text-decoration:none;">&#10138;</a>'
}

Lino.fk_renderer = function(fkname,handlername) {
  //~ console.log('Lino.fk_renderer handler=',handler);
  return function(value, metaData, record, rowIndex, colIndex, store) {
    //~ console.log('Lino.fk_renderer',fkname,rowIndex,colIndex,record,metaData,store);
    //~ if (record.phantom) return '';
    if (value) {
        return Lino.link_button('javascript:'+handlername + '.run(null,{record_id:\'' + String(record.data[fkname]) + '\'})")') + value;
        // until 20140822 (clickable foreign keys):
        // var s = '<a href="javascript:' ;
        // s += handlername + '.run(null,{record_id:\'' + String(record.data[fkname]) + '\'})">';
        // s += value + '</a>';
        // return s
    }
    return '';
  }
};

Lino.lfk_renderer = function(panel,fkname) {
  //~ console.log('Lino.fk_renderer handler=',handler);
  var handlername = 'console.log';
  return function(value, metaData, record, rowIndex, colIndex, store) {
    //~ console.log('Lino.fk_renderer',fkname,rowIndex,colIndex,record,metaData,store);
    if (record.phantom) return '';
    if (value) {
        var s = '<a href="javascript:' ;
        s += handlername + '({},{record_id:\'' + String(record.data[fkname]) + '\'})">';
        s += value + '</a>';
        //~ console.log('Lino.fk_renderer',value,'-->',s);
        return s
    }
    return '';
  }
};

//~ Lino.gfk_renderer = function() {
  //~ return function(value, metaData, record, rowIndex, colIndex, store) {
    //~ if (record.phantom) return '';
    //~ console.log('Lino.gfk_renderer',value,colIndex,record,metaData,store);
    //~ return value;
  //~ }
//~ };


Lino.build_buttons = function(panel,actions) {
  //~ console.log("20121006 Lino.build_buttons",actions);
  if (actions) {
    var buttons = Array(actions.length);
    var cmenu = Array(actions.length);
    var keyhandlers = {};
    for (var i=0; i < actions.length; i++) { 
      var a = actions[i];
      if (a.menu) a.menu = Lino.build_buttons(panel,a.menu).bbar;
      buttons[i] = a;
      cmenu[i] = {
            text : a.menu_item_text,
            iconCls : a.iconCls,
            menu : a.menu,
            itemId : a.itemId
          };
      if (a.panel_btn_handler) {
          var h = a.panel_btn_handler.createCallback(panel);
          if (a.auto_save == true) {
              h = panel.do_when_clean.createDelegate(panel,[true,h]);
          } else if (a.auto_save == null) {
              h = panel.do_when_clean.createDelegate(panel,[false,h]);
          } else if (a.auto_save == false) {
              // h = h;
          } else {
              console.log("20120703 unhandled auto_save value",a)
          }
          buttons[i].handler = h;
          cmenu[i].handler = h;
          if (a.keycode) {
              keyhandlers[a.keycode] = h;
          }
          //~ if (buttons[i].xtype == 'splitbutton') {
              //~ cmenu[i].menu = a.menu;
          //~ } else {
              //~ cmenu[i].handler = h;
          //~ }
      } else {
          console.log("action without panel_btn_handler",a)
          // cmenu[i].handler = a.handler;
      }
    }
    return {
        bbar:buttons, 
        cmenu:new Ext.menu.Menu(cmenu),
        keyhandlers: keyhandlers
    };
  }
}

Lino.do_when_visible = function(cmp,todo) {
  //~ if (cmp.el && cmp.el.dom) 
  if (cmp.isVisible()) { 
    // 'visible' means 'rendered and not hidden'
    //~ console.log(cmp.title,'-> cmp is visible now');
    todo(); 
  //~ } else {
      //~ cmp.on('resize',todo,cmp,{single:true});
  //~ }
  //~ if (false) { // 20120213
  } else { 
    //~ console.log('Lino.do_when_visible() must defer because not isVisible()',todo,cmp);
    if (cmp.rendered) {
      //~ console.log(cmp,'-> cmp is rendered but not visible: and now?');
      //~ console.log(cmp.title,'-> cmp is rendered but not visible: try again in a moment...');
      //~ var fn = function() {Lino.do_when_visible(cmp,todo)};
      //~ fn.defer(100);
      
      Lino.do_when_visible.defer(50,this,[cmp,todo]);
      //~ Lino.do_when_visible.defer(100,this,[cmp,todo]);
      
    } else {
      //~ console.log(cmp.title,'-> after render');
      cmp.on('afterrender',todo,cmp,{single:true});
    }
  }
  
};    

/*
*/
Lino.do_on_current_record = function(panel, fn, phantom_fn) {
  // console.log('20140930 do_on_current_record', arguments);
  var rec = panel.get_current_record();
  if (rec == undefined) {
    Lino.notify("There's no selected record.");
    return;
  }
  // 20120307 A VirtualTable with a Detail (lino.Models) has only "phantom" records.
  if (rec.phantom) {
    //~ if (!panel.editable) { console.log("20120312 not editable:",panel)}
    if (phantom_fn) {
      phantom_fn(panel);
    } else {
      Lino.notify("Action not available on phantom record.");
    }
    return;
  }
  return fn(rec);
};


Lino.call_ajax_action = function(
    panel, method, url, p, actionName, step, on_confirm, on_success) {
  p.an = actionName;
  if (!panel || !panel.isVisible()) {
  //~ if (true) { // 20131026 : workflow_actions of a newly created record detail executed but did't refresh the screen because their requesting panel was the insert (not the detail) formpanel.
      if (Lino.current_window) 
          panel = Lino.current_window.main_item;
      else panel = Lino.viewport;
  }
  // console.log("20150130 a", p.pv);
  // Ext.apply(p, panel.get_base_params());
  // console.log("20150130 b", p.pv);

  if (panel.get_selected && p.sr === undefined) {
      var selected_recs = panel.get_selected();
      //~ console.log("20130831",selected_recs);
      var rs = Array(selected_recs.length);
      for(var i=0; i < selected_recs.length;i++) {
          rs[i] = selected_recs[i].data[panel.ls_id_property];
      };
      p.sr = rs;
  }
  
  // console.log("20170731 Lino.call_ajax_action", Ext.Ajax, p, actionName, step);
  
  if (panel.loadMask) panel.loadMask.show(); 
    
  // Ext.Ajax.params = {}; 
  Ext.Ajax.request({
    method: method
    ,url: url
    ,params: p
    ,success: Lino.action_handler(panel, on_success, on_confirm)
    ,failure: Lino.ajax_error_handler(panel)
  });
};




Lino.row_action_handler = function(actionName, hm, pp) {
  var fn = function(panel, btn, step) {
      var p = {};
      // console.log('20150514 row_action_handler');
      if (pp) { p = pp(panel); if (! p) return; }
      
      if (!panel || panel.get_current_record == undefined) { // AFTER_20130725
        // console.log('20140930 row_action_handler 2', panel);
        panel = Ext.getCmp(panel);
        if (panel == undefined) {
          console.log("20160410 Invalid panel spec.", actionName, hm, pp);
          Lino.notify("Invalid panel spec.");
          return;
        }
      }
      
      Lino.do_on_current_record(panel, function(rec) {
          //~ console.log(panel);
          panel.add_param_values(p, true);
          Ext.apply(p, panel.get_base_params());
          Lino.call_ajax_action(
              panel, hm, panel.get_record_url(rec.id), 
              p, actionName, step, fn);
      });
  };
  return fn;
};

Lino.list_action_handler = function(ls_url,actionName,hm,pp) {
  var url = '/api' + ls_url
  var fn = function(panel,btn,step) {
      var p = {};
      //~ console.log("20121210 Lino.list_action_handler",arguments);
      if (pp) { p = pp(panel);  if (! p) return; }
      if (panel) { // may be undefined when called e.g. from quicklink
          panel.add_param_values(p, true);
          Ext.apply(p, panel.get_base_params());
      }
      Lino.call_ajax_action(panel, hm,url, p, actionName, step, fn);
  };
  return fn;
};

Lino.param_action_handler = function(window_action) { // 20121012
  var fn = function(panel,btn,step) {
    Lino.do_on_current_record(panel,function(rec) {
      window_action.run(panel.getId(),{}); 
    });
  };
  return fn;
};


Lino.run_row_action = function(
    requesting_panel, is_on_main_actor, url, meth, pk,
    actionName, params, preprocessor) {
  //~ var panel = action.get_window().main_item;
  // console.log("20140930 Lino.run_row_action", params);
  url = '/api' + url  + '/' + pk;
  var panel = Ext.getCmp(requesting_panel);
  // var params = {}
  // if (init_params) Ext.apply(params, init_params);
  if (!params) params = {};
  if (preprocessor) {
      var p = preprocessor(); 
      Ext.apply(params, p);
  }
  if (panel && is_on_main_actor) {
      Ext.apply(params, panel.get_base_params())
  }else {
     params.sr = pk
  }
  Lino.insert_subst_user(params);

  var fn = function(panel, btn, step) {
    Lino.call_ajax_action(panel, meth, url, params, actionName, step, fn);
  }
  fn(panel, null, null);
}


Lino.show_detail = function(panel, btn) {
  Lino.do_on_current_record(panel, 
    function(rec) {
      //~ panel.loadMask.show();
      Lino.run_detail_handler(panel, rec.id);
    },
    Lino.show_insert
  );
};

Lino.run_detail_handler = function(panel,pk) {
  var bp = panel.get_base_params();
  panel.add_param_values(bp); // 20120918
  var status = {
    record_id:pk,
    base_params:bp
  }
  //~ console.log("20120918 Lino.show_detail",status);
  panel.ls_detail_handler.run(null,status);
}

Lino.show_fk_detail = function(combo,detail_action,insert_action) {
    //~ console.log("Lino.show_fk_detail",combo,handler);
    pk = combo.getValue();
    if (pk) {
        detail_action.run(null,{record_id: pk})
      } else {
        insert_action.run(null);
        //~ Lino.notify("Cannot show detail for empty foreign key.");
      }
};

Lino.show_insert = function(panel,btn) {
  var bp = panel.get_base_params();
  //~ console.log('20120125 Lino.show_insert',bp)
  //~ panel.ls_insert_handler.run(null,{record_id:-99999,base_params:bp});
  panel.ls_insert_handler.run(panel.getId(),{base_params:bp});
};



if (Ext.ux.grid !== undefined) {
    Lino.GridFilters = Ext.extend(Ext.ux.grid.GridFilters,{
      encode:true,
      local:false
    });
} else {
    Lino.GridFilters = function() {}; // dummy
    Ext.override(Lino.GridFilters,{
      init : function() {}
    });
};



Lino.FieldBoxMixin = {
  before_init : function(config,params) {
    if (params) Ext.apply(config,params);
    var actions = Lino.build_buttons(this, config.ls_bbar_actions);
    if (actions) config.bbar = actions.bbar;
  },
  //~ constructor : function(ww,config,params){
    //~ this.containing_window = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.superclass.constructor.call(this, config);
  //~ },
  do_when_clean : function(auto_save,todo) { todo() },
  //~ format_data : function(html) { return '<div class="htmlText">' + html + '</div>' },
  format_data : function(html) { return html },
  get_base_params : function() {
    // needed for insert action
    var p = Ext.apply({}, this.base_params);
    Lino.insert_subst_user(p);
    return p;
  },
  set_base_params : function(p) {
    this.base_params = Ext.apply({},p);
    //~ if (p.param_values) this.set_param_values(p.param_values);  
  },
  clear_base_params : function() {
      this.base_params = {};
      Lino.insert_subst_user(this.base_params);
  },
  set_base_param : function(k,v) {
    this.base_params[k] = v;
  }
};

Ext.override(Ext.form.HtmlEditor, {
    fixKeys : function(){
        if(Ext.isIE){
            return function(e){
                var k = e.getKey(),
                    doc = this.getDoc(),
                        r;
                if(k == e.TAB){
                    e.stopEvent();
                    r = doc.selection.createRange();
                    if(r){
                        r.collapse(true);
                        r.pasteHTML('&nbsp;&nbsp;&nbsp;&nbsp;');
                        this.deferFocus();
                    }
                }else if(k == e.ENTER){
                    r = doc.selection.createRange();
                    if(r){
                        var target = r.parentElement();
                        if(!target || target.tagName.toLowerCase() != 'li'){
                            e.stopEvent();
                            r.pasteHTML('<br />');
                            r.collapse(false);
                            r.select();
                        }
                    }
                }
            };
        }else if(Ext.isOpera){
            return function(e){
                var k = e.getKey();
                if(k == e.TAB){
                    e.stopEvent();
                    this.win.focus();
                    this.execCmd('InsertHTML','&nbsp;&nbsp;&nbsp;&nbsp;');
                    this.deferFocus();
                }
            };
        }else if(Ext.isWebKit){
            // HKC : this is probably our most used case.
            return function(e){
                var k = e.getKey();
                if(k == e.TAB){
                    e.stopEvent();
                    this.execCmd('InsertText','\t');
                    this.deferFocus();
                }else if(k == e.ENTER){
                    e.stopEvent();
                    this.execCmd('InsertHtml','<br /><br />');
                    this.deferFocus();
                }
             //   HKC
               else if (k == e.S && e.ctrlKey){
                    e.stopEvent();
                    e.preventDefault();
                    //this.getWin.fireEvent('keyup');
                    // this.fireKey(e);
                    console.log('HTMLEditor is saving...');
                }
             };
        }
    }(),
    // bubbleEvents : ['keypress']
    // initComponent : function() {
    //     Ext.form.HtmlEditor.superclass.initComponent.call(this);
    //     this.addEvents('submit');
    // },
    // submit : function (event) {
    //     console.log("rrrrr");
    // },
    // initEditor : function() {
    //     Ext.form.HtmlEditor.superclass.initEditor.call(this);
    //     if (Ext.isGecko) {
    //         Ext.EventManager.on(this, 'keypress', this.fireSubmit, this);
    //     }
    //     if (Ext.isIE || Ext.isWebKit || Ext.isOpera) {
    //         Ext.EventManager.on(this, 'keydown', this.fireSubmit,
    //             this);
    //     }
    // },
    fireSubmit : function(e) {
        console.log("fireSubmit ...");
    }
});


Lino.HtmlBoxPanel = Ext.extend(Ext.Panel, Lino.PanelMixin);
Lino.HtmlBoxPanel = Ext.extend(Lino.HtmlBoxPanel, Lino.FieldBoxMixin);
Lino.HtmlBoxPanel = Ext.extend(Lino.HtmlBoxPanel, {
  disabled_in_insert_window : true,
  constructor : function(config,params) {
    this.before_init(config,params);
    Lino.HtmlBoxPanel.superclass.constructor.call(this, config);
  },
  //~ constructor : function(ww,config,params){
    //~ this.ww = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.constructor.call(this, ww,config,params);
  //~ },
  //~ constructor : function(ww,config,params){
    //~ this.ww = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.superclass.constructor.call(this, config);
  //~ },
  //~ disable : function() { var tb = this.getBottomToolbar(); if(tb) tb.disable()},
  //~ enable : function() { var tb = this.getBottomToolbar(); if(tb) tb.enable()},
  onRender : function(ct, position){
    Lino.HtmlBoxPanel.superclass.onRender.call(this, ct, position);
    //~ console.log(20111125,this.containing_window);
    if (this.containing_panel) {
      this.containing_panel.on('enable',this.enable,this);
      this.containing_panel.on('disable',this.disable,this);
    }
    this.el.on({
      dragenter:function(event){
        event.browserEvent.dataTransfer.dropEffect = 'move';
        return true;
      }
      ,dragover:function(event){
        event.browserEvent.dataTransfer.dropEffect = 'move';
        event.stopEvent();
        return true;
      }
      ,drop:{
        scope:this
        ,fn:function(event){
          event.stopEvent();
          //~ console.log(20110516);
          var files = event.browserEvent.dataTransfer.files;
          if(files === undefined){
            return true;
          }
          var len = files.length;
          while(--len >= 0){
            console.log(files[len]);
            //~ this.processDragAndDropFileUpload(files[len]);
          }
          Lino.show_insert(this);
        }
      }
    });
  },
  refresh : function(unused) { 
      // this.containing_panel.refresh();
      this.refresh_with_after();
  },
  /* HtmlBoxPanel */
  refresh_with_after : function(after) {
      // var todo = this.containing_panel.refresh();
      var box = this.items.get(0);
      var todo = function() {
        if (this.disabled) { return; }
        this.set_base_params(this.containing_panel.get_master_params());

        var el = box.getEl();
        if (el) {
            var record = this.containing_panel.get_current_record();
            var newcontent = record ? 
                this.format_data(record.data[this.name]) : '';
            // console.log('20140917 HtmlBox.refresh()',
            //             this.name, record.data.LinksByHuman);
            el.update(newcontent, true);
        // } else {
        //     console.log('20140502 cannot HtmlBox.refresh()',this.name);
        }
      };

      Lino.do_when_visible(box, todo.createDelegate(this));
  }
});
//~ Ext.override(Lino.HtmlBoxPanel,Lino.FieldBoxMixin);


Lino.ActionFormPanel = Ext.extend(Ext.form.FormPanel,Lino.MainPanel);
Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, Lino.PanelMixin);
Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, Lino.FieldBoxMixin);
Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, {
  //~ layout:'fit'
  //~ ,autoHeight: true
  //~ ,frame: true
  window_title : "Action Parameters",
  constructor : function(config){
    config.buttons = [
        {text: 'OK', handler: this.on_ok, scope: this},
        {text: 'Cancel', handler: this.on_cancel, scope: this}
    ];
    Lino.ActionFormPanel.superclass.constructor.call(this, config);
  }
  //~ ,initComponent : function(){
    //~ Lino.ActionFormPanel.superclass.initComponent.call(this);
  //~ }
  ,on_cancel : function() { 
    this.get_containing_window().close();
  }
  ,on_ok : function() { 
    var panel = this.requesting_panel;
    // var panel = this.get_containing_window().main_item;
    // console.log("20131004 on_ok",this,panel,arguments);
    var actionName = this.action_name;
    var pk = this.record_id || this.default_record_id;
    if (pk == undefined && this.base_params) { pk = this.base_params.mk; }
    if (pk == undefined && panel) {
        pk = panel.get_current_record().id;
    }
    if (pk == undefined) {
        // 20170101 VerifyUser action
        pk = '-99998';
        // Lino.alert("Sorry, dialog action without base_params.mk");
        // return;
    }
    var self = this;
    // function on_success() { self.get_containing_window().close(); };
    // see 20131004 and 20140430
    var url = '/api';

    // 20150119 : The OK button on AgentsByClient.create_visit went to
    // /api/pcsw/Clients/ instead of /api/pcsw/Coachings/
    // if (panel) 
    //     url += panel.ls_url;
    // else 
    //     url += this.ls_url;

    if (this.ls_url) 
        url += this.ls_url;
    else 
        url += panel.ls_url;
    url += '/' + pk;
    // wrap into function to prepare possible recursive call
    var fn = function(panel, btn, step) {
      var p = {};
      self.add_field_values(p)
      if (panel) Ext.apply(p, panel.get_base_params());
      delete p.pv;
      // console.log("20150130", p.pv);

      Lino.call_ajax_action(
          panel, 'GET', url, p, actionName, step, fn); //  , on_success);
    }
    fn(panel, null, null);
    
    
  }
  /* ActionFormPanel*/
  ,set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    //~ console.log('20120918 ActionFormPanel.set_status()',status,rp,this.requesting_panel);
    this.clear_base_params();
    if (status == undefined) status = {};
    //~ if (status.param_values) 
    this.set_field_values(status.field_values);
    if (status.base_params) this.set_base_params(status.base_params);
    this.record_id = status.record_id;
  }
  
  ,before_row_edit : function(record) {}
  ,add_field_values : function (p) { // similar to add_param_values()
      /* LS 20160517 : Until now Lino tested whether the form is
       dirty, and if not, submitted only the values which had been set
       by set_status. But now status_field_values can be empty because
       Action.keep_user_values is True. In that case we must submit
       the current values even if the form is not dirty.  I don't
       remember why we had this feature of not submitting unmodified
       field values, so I remove this feature for now. */
      p.fv = this.get_field_values();
      // if (this.form.isDirty()) {
      //   p.fv = this.get_field_values();
      // }else{
      //   // console.log("20160517 add_param_values not dirty, status_field_values",
      //   //             this.status_field_values);
      //   if (this.status_field_values) 
      //     p.fv = Lino.fields2array(
      //         this.fields, this.status_field_values);
      // }
      //~ console.log("20120203 add_param_values added pv",pv,"to",p);
  }
  ,get_field_values : function() {
      return Lino.fields2array(this.fields);
  }
  ,set_field_values : function(pv) {
      // console.log('20160516 MainPanel.set_param_values', pv);
      // if Action.keep_user_values, we receive an empty dict ({})
      this.status_field_values = pv;
      if (pv) {
          this.form.my_loadRecord(pv);
          var record = { data: pv };
          this.before_row_edit(record);
      } else {
          this.form.reset(); 
          this.before_row_edit();
      }
  }
  ,config_containing_window : function(wincfg) { 
      wincfg.title = this.window_title;
      wincfg.keys = [
        { key: Ext.EventObject.ENTER, fn: this.on_ok, scope: this }
      ];
      
      if (!wincfg.defaultButton) this.getForm().items.each(function(f){
          if(f.isFormField){ 
              wincfg.defaultButton = f;
              return false;
          }
      });

  }
});

    
Lino.fields2array = function(fields, values) {
    // console.log('20160517 fields2array gonna loop on', fields, values);
    var pv = Array(fields.length);
    for(var i=0; i < fields.length;i++) {
        var f = fields[i]
        if (values) 
          var v = values[f.name];
        else 
          var v = f.getValue();
        if (f.formatDate) {
            pv[i] = f.formatDate(v); 
        } else {
            pv[i] = v; // f.getValue(); 
        }
    }
    // console.log('20160517 fields2array returns', pv);
    return pv;
}


Lino.FormPanel = Ext.extend(Ext.form.FormPanel,Lino.MainPanel);
Lino.FormPanel = Ext.extend(Lino.FormPanel,Lino.PanelMixin);
Lino.FormPanel = Ext.extend(Lino.FormPanel,{
  params_panel_hidden : false,
  save_action_name : null, 
  //~ base_params : {},
  //~ trackResetOnLoad : true,
  //~ query_params : {},
  //~ 20110119b quick_search_text : '',
  constructor : function(config,params){
    if (params) Ext.apply(config,params);
    this.base_params = {};
    //~ ww.config.base_params.query = ''; // 20111018
    //~ console.log(config);
    //~ console.log('FormPanel.constructor() 1',config)
    //~ Ext.applyIf(config,{base_params:{}});
    //~ console.log('FormPanel.constructor() 2',config)
      
    config.trackResetOnLoad = true;
  
    Lino.FormPanel.superclass.constructor.call(this, config);

    //~ this.set_base_param('$URL_PARAM_FILTER',null); // 20111018
    //~ this.set_base_param('$URL_PARAM_FILTER',''); // 20111018
      
  },
  initComponent : function(){
    
    this.containing_panel = this;

    //~ console.log("20111201 containing_window",this.containing_window,this);
    var actions = Lino.build_buttons(this, this.ls_bbar_actions);
    if (actions) {
        this.bbar = actions.bbar;
        // console.log("20160829 tooltip", actions.bbar);
    //~ } else {
        //~ this.bbar = [];
    }
    //~ Ext.apply(config,Lino.build_buttons(this,config.ls_bbar_actions));
    //~ config.bbar = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ var config = this;
    
    //~ if (this.containing_window instanceof Lino.DetailWrapper) {
    
    //~ console.log('20120121 initComponent', this.action_name);
    //~ if (this.action_name == 'detail' | this.action_name == 'show') {
    //~ if (this.action_name != 'insert') {
    if (! this.hide_top_toolbar) {
      this.tbar = [];
      // 20111015    
      if (! this.hide_navigator) {
        this.record_selector = new Lino.RemoteComboFieldElement({
          store: new Lino.ComplexRemoteComboStore({
            //~ baseParams: this.containing_window.config.base_params,
            baseParams: this.get_base_params(),
            //~ value: this.containing_window.config.base_params.query,
            proxy: new Ext.data.HttpProxy({
              url: '/choices' + this.ls_url,
              method:'GET'
            })
          }),
          pageSize:25,
          listeners: { 
            scope:this, 
            select:function(combo,record,index) {
              //~ console.log('jumpto_select',arguments);
              this.goto_record_id(record.id);
            }
          },
          emptyText: "Go to record"
        })
        this.tbar = this.tbar.concat([this.record_selector]);
        
        this.tbar = this.tbar.concat([
          this.first = new Ext.Toolbar.Button({
              tooltip:"First",disabled:true,
              handler:this.moveFirst,scope:this,iconCls:'x-tbar-page-first'}),
          this.prev = new Ext.Toolbar.Button({
              tooltip:"Previous",disabled:true,
              handler:this.movePrev,scope:this,iconCls:'x-tbar-page-prev'}),
          this.next = new Ext.Toolbar.Button({
              tooltip:"Next",disabled:true,
              handler:this.moveNext,scope:this,iconCls:'x-tbar-page-next'}),
          this.last = new Ext.Toolbar.Button({
              tooltip:"Last",disabled:true,
              handler:this.moveLast,scope:this,iconCls:'x-tbar-page-last'})
        ]);
      }
      this.tbar = this.add_params_panel(this.tbar);
      
      this.tbar = this.tbar.concat([
        {
            handler:function(){ this.do_when_clean(
                false, this.refresh.createDelegate(this)) },
          iconCls: 'x-tbar-loading',
          tooltip:"Reload current record",
          scope:this}
      ]);
          
      if (this.bbar) { // since 20121016
        if (this.tbar) {
            this.tbar = this.tbar.concat(['-']) ;
        } else {
          this.tbar = [];
        }
        this.tbar = this.tbar.concat(this.bbar) ;
        this.bbar = undefined;
      }
    
      this.tbar = this.tbar.concat([
          '->',
          this.displayItem = new Ext.Toolbar.TextItem({})
      ]);
          
    }
    //~ if (this.content_type && this.action_name != 'insert') {
      //~ this.bbar = this.bbar.concat([
        //~ '->',
        //~ { text: "[$_('Help Text Editor')]",
          //~ handler: Lino.help_text_editor,
          //~ qtip: "$_('Edit help texts for fields on this model.')",
          //~ scope: this}
      //~ ])
    //~ }
    //~ this.before_row_edit = config.before_row_edit.createDelegate(this);
      
    //~ if (this.master_panel) {
        //~ this.set_base_params(this.master_panel.get_master_params());
    //~ }
      
    Lino.FormPanel.superclass.initComponent.call(this);

    // this.on('show',
    //         function(){ this.init_focus();}, 
    //         this);
    
    this.on('render',function(){
      this.loadMask = new Ext.LoadMask(this.bwrap,{msg:"Please wait..."});
    },this);
    
    
    if (this.action_name == 'insert') {
      this.cascade(function(cmp){
        if (cmp.disabled_in_insert_window) {
            // console.log('20110613 disabled_in_insert_window', cmp);
            //~ cmp.disable();
            cmp.hide();
        }
      });
      
    }
    
  },
  
  unused_init_focus : function(){ 
    // set focus to the first field
    console.log("20140205 Lino.FormPanel.init_focus");
    // Lino.FormPanel.superclass.focus.call(this);
    this.getForm().items.each(function(f){
        if(f.isFormField && f.rendered){ 
            f.focus();
            console.log("20140205 focus", f);
            return false;
        }
    });
  },

  /* FormPanel */
  get_status : function(){
      var st = {
        base_params: this.get_base_params(),
        // data_record : this.get_current_record()
      }
      var rec = this.get_current_record();
      if (rec) st.record_id = rec.id;
      // 20140917 : get_status must not store the whole data_record
      // because that would prevent the form to actually reload
      // when set_status is called after a child window closed.
      
      var tp = this.items.get(0);
      if (tp instanceof Ext.TabPanel) {
        st.active_tab = tp.getActiveTab();
      }
      st.param_values = this.status_param_values;
      return st;
  },

  /* FormPanel */
  set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    // console.log('20140917 FormPanel.set_status()', status);
    this.clear_base_params();
    if (status == undefined) status = {};
    //~ if (status.param_values) 
    this.set_param_values(status.param_values);
    if (status.base_params) this.set_base_params(status.base_params);
    var tp = this.items.get(0);
    if (tp instanceof Ext.TabPanel) {
      if (status.active_tab) {
        //~ console.log('20111201 active_tab',this.active_tab,this.items.get(0));
        //~ tp.activeTab = status.active_tab;
        tp.setActiveTab(status.active_tab);
        //~ this.main_item.items.get(0).activate(status.active_tab);
      } else {
        if (! status.data_record) {  // 20141206
            tp.setActiveTab(0);
        }
      }
    }
    
    if (status.data_record) {
      /* defer because set_window_title() didn't work otherwise */
      // 20140421 removed defer for bughunting to simplify side effects
      // this.set_current_record.createDelegate(
      //     this, [status.data_record]).defer(100);
      this.set_current_record(status.data_record);
      //~ return;
    } else {
        var record_id = status.record_id || this.default_record_id;
        if (record_id != undefined) { 
          /* possible values include 0 and null, 0 being a valid record id, 
          null the equivalent of undefined
          */
          this.load_record_id(record_id);
        } else {
            this.set_current_record(undefined);
        }
    }
    // this.init_focus()
  }
  ,get_base_params : function() {  /* FormPanel */
    // needed for insert_action
    var p = Ext.apply({}, this.base_params);
    Lino.insert_subst_user(p);
    return p;
  }
  ,set_base_params : function(p) {
    //~ this.base_params = Ext.apply({},this.base_params); // make sure it is an instance variable
    delete p['query'] // 20120725
    Ext.apply(this.base_params,p);
    if (this.record_selector) {
        var store = this.record_selector.getStore();
        for (k in p) store.setBaseParam(k,p[k]);
        delete this.record_selector.lastQuery;
        //~ console.log("20120725 record_selector.setBaseParam",p)
    }
  }
  ,clear_base_params : function() {
      this.base_params = {};
      Lino.insert_subst_user(this.base_params);
  }
  ,set_base_param : function(k,v) {
    this.base_params[k] = v;
  }
  ,after_delete : function() {
    if (this.current_record.navinfo.next)
      this.moveNext();
    else if (this.current_record.navinfo.prev)
      this.movePrev();
    else 
      this.abandon();
  }
  ,moveFirst : function() {this.goto_record_id(
      this.current_record.navinfo.first)}
  ,movePrev : function() {this.goto_record_id(
      this.current_record.navinfo.prev)}
  ,moveNext : function() {this.goto_record_id(
      this.current_record.navinfo.next)}
  ,moveLast : function() {this.goto_record_id(
      this.current_record.navinfo.last)}
  
  ,refresh : function(unused) { 
      this.refresh_with_after();
  }
  /* FormPanel */
  ,refresh_with_after : function(after) { 
    // console.log('20140917 Lino.FormPanel.refresh_with_after()',this);
    if (this.current_record) {
        this.load_record_id(this.current_record.id, after);
    } else {
        this.set_current_record(undefined, after);
    }
  }
  
  ,do_when_clean : function(auto_save, todo) {
    var this_ = this;
    if (this.form.isDirty()) {
        // console.log('20140421 do_when_clean : form is dirty')
        if (auto_save) {
            this_.save(todo);
        } else {
          //~ console.log('20111217 do_when_clean() form is dirty',this.form);
          var config = {title:"Confirmation"};
          config.buttons = Ext.MessageBox.YESNOCANCEL;
          config.msg = "Save changes to current record ?";
          config.fn = function(buttonId,text,opt) {
            //~ console.log('do_when_clean',buttonId)
            if (buttonId == "yes") {
                //~ Lino.submit_detail(this_,undefined,todo);
                //~ this_.containing_window.save(todo);
                this_.save(todo);
            } else if (buttonId == "no") { 
              todo();
            }
          }
          Ext.MessageBox.show(config);
        }
    }else{
      // console.log('20140421 do_when_clean : now!')
      todo();
    }
  }
  
  ,goto_record_id : function(record_id) {
    // console.log('20140917 Lino.FormPanel.goto_record_id()',record_id);
    //~ var this_ = this;
    //~ this.do_when_clean(function() { this_.load_record_id(record_id) }
    this.do_when_clean(
        true, this.load_record_id.createDelegate(this, [record_id]));
  }
  
  ,load_record_id : function(record_id, after) {
    var this_ = this;
    var p = Ext.apply({}, this.get_base_params());
    if (this.action_name)
        p.an = this.action_name;
    p.rp = this.getId();
    p.fmt = 'json';
    this.add_param_values(p);
    if (this.loadMask) this.loadMask.show();
    Ext.Ajax.request({ 
      waitMsg: 'Loading record...',
      method: 'GET',
      params: p,
      scope: this,
      url: this.get_record_url(record_id),
      success: function(response) {   
        // todo: convert to Lino.action_handler.... but result 
        if (this.loadMask) this.loadMask.hide();
        if (response.responseText) {
          var rec = Ext.decode(response.responseText);
          // console.log('20150905 load_record_id success', rec);
          this.set_param_values(rec.param_values);
          this.set_current_record(rec, after);
        }
      },
      failure: Lino.ajax_error_handler(this)
    });
  }

  ,abandon : function () {
    Ext.MessageBox.alert('Note',
      "No more records to display. Detail window has been closed.");
    Lino.close_window();
  }
  
  ,set_current_record : function(record, after) {
    // console.log('20160825 set_current_record', record);
    if (this.record_selector) {
        this.record_selector.clearValue();
        // e.g. InsertWrapper FormPanel doesn't have a record_selector
    }
    this.current_record = record;
    if (record && record.data) {
      this.enable();
      this.form.my_loadRecord(record.data);
      this.set_window_title(record.title);
      //~ this.getBottomToolbar().enable();
      var da = record.data.disabled_fields;
      if (da) {
          //~ console.log('20120528 disabled_fields =',da,this.getBottomToolbar());
          //~ 20121016 this.getBottomToolbar().items.each(function(item,index,length){
          if(this.hide_top_toolbar) {
              var tb = this.getBottomToolbar();
          } else {
              var tb = this.getTopToolbar();
          }
          if (tb) tb.items.each(function(item,index,length){
              //~ console.log('20120528 ',item.itemId,'-->',da[item.itemId]);
              if (da[item.itemId]) item.disable(); else item.enable();
          });
      };
      if (this.disable_editing | record.data.disable_editing) {
          //~ console.log("20120202 disable_editing",record.title);
          this.form.items.each(function(cmp){
            if (!cmp.always_enabled) cmp.disable();
          },this);
      } else {
          this.form.items.each(function(cmp){
            //~ console.log("20120202",cmp);
            if (record.data.disabled_fields[cmp.name]) cmp.disable();
            else cmp.enable();
          },this);
        
          //~ if (record.data.disabled_fields) {
              //~ for (i = 0; i < record.data.disabled_fields.length; i++) {
                  //~ var flds = this.find('name',record.data.disabled_fields[i]);
                  //~ if (flds.length == 1) { 
                    //~ flds[0].disable(); 
                  //~ }
              //~ }
          //~ }
      };
      if (this.first) {
        if (record.navinfo  && ! this.hide_navigator) {
          this.first.setDisabled(!record.navinfo.first);
          this.prev.setDisabled(!record.navinfo.prev);
          this.next.setDisabled(!record.navinfo.next);
          this.last.setDisabled(!record.navinfo.last);
          this.displayItem.setText(record.navinfo.message);
        } else {
          this.first.setDisabled(true);
          this.prev.setDisabled(true);
          this.next.setDisabled(true);
          this.last.setDisabled(true);
        }
      }
    } else {
      if (this.form.rendered) 
        this.form.reset(); /* FileUploadField would fail when resetting a non-rendered form */
      //~ this.disable();
      //~ this.getBottomToolbar().disable();
      this.form.items.each(function(cmp){
        cmp.disable();
      },this);
      this.set_window_title(this.empty_title);
      //~ this.containing_window.window.setTitle(this.empty_title);
      if (!this.hide_navigator) {
        this.first.disable();
        this.prev.disable();
        this.next.disable();
        this.last.disable();
      }
    }
    // console.log('20140917 gonna call before_row_edit', record);
        var current_focus_fields = false;
        for (var i = 0; i < this.form.items.items.length;i++) {
            if (this.form.items.items[i].hasFocus) current_focus_fields = i;
        }
    this.before_row_edit(record);
        if (current_focus_fields != false){
            this.form.items.items[current_focus_fields].focus();
        }
    // console.log('20140917 gonna call after', after);
    if (after) after();
  },
  
  /* FormPanel */
  before_row_edit : function(record) {},
  search_change : function(field,oldValue,newValue) {
    //~ console.log('search_change',field.getValue(),oldValue,newValue)
    this.set_base_param('query',field.getValue()); 
    this.refresh();
  },
  
//  get_selected : function() { return [ this.current_record ] },
  get_current_record : function() {  
    //~ console.log(20100714,this.current_record);
    return this.current_record 
  },
  
  get_permalink_url : function() {
      var rec = this.get_current_record();
      if (rec && ! rec.phantom && rec.id != -99998)
          return '/api' 
              + this.ls_url + '/' + rec.id;
      return '/api' + this.ls_url;
    
  },
  add_param_tab : function(p) {
    var main = this.items.get(0);
    if (main.activeTab) {
      var tab = main.items.indexOf(main.activeTab);
      // console.log('20150130 main.activeTab', tab, main.activeTab);
      if (tab) p.tab = tab;
    // } else {
    //   console.log('20150130 no main.activeTab');
    }
  },
  get_permalink_params : function() {
    var p = {};
    //~ var p = {an:'detail'};
    if (this.action_name)
        p.an = this.action_name;
    this.add_param_tab(p)
    this.add_param_values(p)
    return p;
  }
  
  ,validate_form : function() {  // not used. see actions.ValidateForm
      // var ov = {};
      // this.form.items.each(function(f){
      //     ov[f.name] = f.originalValue
      // });

      // console.log('20140509 FormPanel.validate_form', ov);
      // var after = function() { 
      //     this.form.items.each(function(f){
      //         f.originalValue = ov[f.name];
      //     });
      // }
      // this.save2(null, 'validate', after);
      this.save2(null, 'validate');
  }

  /* Lino.FormPanel */
  ,save : function(after) {
    var action_name = this.save_action_name;
    if (!action_name) 
        action_name = this.action_name;
    // console.log('20140503 FormPanel.save', action_name);
    this.save2(after, action_name);
  }

  ,save2 : function(after, action_name) {
    var rec = this.get_current_record();
    if (!rec) { 
        Lino.notify("Sorry, no current record."); 
        return; 
    }
    var panel = this;
    if (this.has_file_upload) this.form.fileUpload = true;
    this.loadMask.show();
    var p = {};
    Ext.apply(p, this.get_base_params());
    p.rp = this.getId();
    p.an = action_name;
    this.add_param_tab(p)
    // console.log('20150216 FormPanel.save()', rec, this.form);
    var submit_config = {
        params: p, 
        scope: this,
        success: function(form, action) {
          this.loadMask.hide();
          Lino.notify(action.result.message);
          Lino.handle_action_result(this, action.result, after);
        },
        failure: function(form,action) { 
          this.loadMask.hide();
          Lino.on_submit_failure(form, action);
        },
        clientValidation: true
    };
    if (rec.phantom) {  // it's a new record
      Ext.apply(submit_config, {
        url: '/api' + this.ls_url,
        method: 'POST'
      });
      // panel.refresh();
      // temporarily disabled. See 20151002
    } else {  // submit on existing row
      Ext.apply(submit_config, {
        url: '/api' 
              + this.ls_url + '/' + rec.id,
        method: 'PUT'
      })
    }
    this.form.submit(submit_config);
  }
  
  ,on_cancel : function() { 
    this.get_containing_window().close();
  }
  ,on_ok : function() { 
      // console.log("20140424");
      // this.save(null, true, this.save_action_name);
      this.save();
  }
  ,config_containing_window : function(wincfg) { 

      // Note that defaultButton means: which component should receive
      // focus when Window is focussed.  If no defaultButton set,
      // specify the first form field.

      if (!wincfg.defaultButton) this.getForm().items.each(function(f){
          if(f.isFormField){ 
              wincfg.defaultButton = f;
              // console.log("20140205 defaultButton", f);
              return false;
          }
      });

      wincfg.keys = [];

      wincfg.keys.push({
          key: Ext.EventObject.ESCAPE, 
          handler: this.on_cancel, scope:this });
      wincfg.keys.push({
          key: 's', ctrl: true, 
             stopEvent: true, handler: this.on_ok, scope:this });
  }

});



Lino.getRowClass = function(record, rowIndex, rowParams, store) {
    //~ console.log(20130816,record);
    //~ return 'x-grid3-row-green';
    //~ return record.data.row_class + ' auto-height';
    return record.data.row_class;
  //~ if (true) {
      //~ return 'x-grid3-row-red';
  //~ }
  //~ if (record.phantom) {
    //~ console.log(20101009,record);
    //~ rowParams.bodyStyle = "color:red;background-color:blue";
    //~ return 'lino-phantom-row';
    //~ }
  //~ console.log('20101009 not a phantom:',record);
  //~ return '';
}

//~ FOO = 0;



Lino.GridStore = Ext.extend(Ext.data.ArrayStore,{ 
  autoLoad: false
  ,load: function(options) {
    //~ foo.bar = baz; // 20120213
    if (!options) options = {};
    if (!options.params) options.params = {};
    options.params.fmt = 'json';
    options.params.rp = this.grid_panel.getId();
    Lino.insert_subst_user(options.params); // since 20121016
      
    var start = this.grid_panel.start_at_bottom ? -1 : 0;
    if (this.grid_panel.hide_top_toolbar) {
        //~ console.log("20120206 GridStore.load() toolbar is hidden");
        options.params.start = start;
        if (this.grid_panel.preview_limit) {
          options.params.limit = this.grid_panel.preview_limit;
        }
    } else {
        var ps = this.grid_panel.calculatePageSize();
        if (!ps) {
          // console.log("GridStore.load() failed to calculate pagesize");
          return false;
        } 
        options.params.limit = ps;
      
        this.grid_panel.getTopToolbar().pageSize =  ps;
        if (options.params.start == undefined)
            // if (start != -1) 
            //     start = this.grid_panel.getTopToolbar().cursor
            options.params.start = start;
      
        // console.log("20141108 GridStore.load() ", options.params);
    }
      
    this.grid_panel.add_param_values(options.params);
    //~ Lino.insert_subst_user(options.params);
    //~ console.log("20120814 GridStore.load()",options.params,this.baseParams);
    return Lino.GridStore.superclass.load.call(this, options);
  }
  // ,insert : function(index, records) {
  //   return Ext.data.Store.prototype.insert.call(this, index, records)
    // return Lino.GridStore.superclass.insert.call(this, index, records);
  // }
});

Lino.get_current_grid_config = function(panel) {
    return panel.get_current_grid_config();
}


// Like the default value for GridView.cellTpl but adds a class "lino-auto-height"
Lino.auto_height_cell_template = new Ext.Template(
'<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
    '<div class="lino-auto-height x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
'</td>'
);

Lino.GridPanel = Ext.extend(Ext.grid.EditorGridPanel, Lino.MainPanel);
Lino.GridPanel = Ext.extend(Lino.GridPanel, Lino.PanelMixin);
Lino.GridPanel = Ext.extend(Lino.GridPanel, {
  quick_search_text : '',
  start_at_bottom : false,
  is_searching : false,
  disabled_in_insert_window : true,
  clicksToEdit:2,
  enableColLock: false,
  autoHeight: false,
  params_panel_hidden : false,
  preview_limit : undefined, 
  // fake_row_content: '<br>',
  row_height: 1,
  //~ loadMask: true,
  //~ viewConfig: {
          //~ getRowClass: Lino.getRowClass,
          //~ emptyText:"$_('No data to display.')"
        //~ },
        
        
  loadMask: {msg:"Please wait..."},
  
  constructor : function(config){

    config.plugins = [new Lino.GridFilters()];
    
    
    Lino.GridPanel.superclass.constructor.call(this,config);
    
    //~ if (this.containing_window) {
        //~ console.log("20111206 install refresh");
        //~ this.containing_window.on('show',this.refresh,this);
    //~ }
    
  },
  
  init_containing_window : function(win) { 
    //~ console.log("20111206 install refresh");
    //~ win.on('show',this.refresh,this);
  }

  ,handle_key_event : function(e) {
    // console.log("20140514 handle_key_event", e, this.keyhandlers);
    var h = this.keyhandlers[e.keyCode];
    if (h) {
        h(this);
        e.stopEvent();
    }
  }
  
  ,initComponent : function(){
    
    /* 
    Problem 20111206:
    When a GridPanel is the main item of the window, then it doesn't 
    have it's own header but uses the window's header bar.
    We must do this in initComponent because e.g. in beforerender 
    it's already to late: a header element has been created because 
    there was a title.
    But Lino.Window adds itself as `this.containing_window` 
    only after the GridPanel has been initialized.
    Workaround is to generate a line "params.containing_window = true;" 
    in the handler function.
    */ 
    if (this.is_main_window) {
        //~ console.log(20111206, 'delete title',this.title,'from',this);
        this.tools = undefined;  
        this.title = undefined;  /* simply deleting it 
          isn't enough because that would only 
          unhide the title defined in some base class. */
    } 
    //~ else console.log(20111206, 'dont delete title',this.title,'from',this);
    
    /* e.g. when slave gridwindow called from a permalink */
    //~ if (this.base_params) Ext.apply(bp,this.base_params);  
    
    var proxy = new Ext.data.HttpProxy({ 
      // 20120814 
      url: '/api' + this.ls_url
      ,method: "GET"
      //~ ,url: ADMIN_URL + '/restful' + this.ls_url
      //~ ,restful: true 
      //~ ,listeners: {load:on_proxy_load} 
      //~ ,listeners: {write:on_proxy_write} 
    });
    //~ config.store = new Ext.data.JsonStore({ 
    //~ this.store = new Ext.data.ArrayStore({ 
    this.store = new Lino.GridStore({ 
      grid_panel: this
      ,listeners: { exception: Lino.on_store_exception }
      ,remoteSort: true
      ,totalProperty: "count"
      ,root: "rows"
      //~ ,id: "id" 
      ,proxy: proxy
      //~ autoLoad: this.containing_window ? true : false
      ,idIndex: this.pk_index
      //~ ,baseParams: bp
      ,fields: this.ls_store_fields
      ,idProperty: this.ls_id_property 
      // 20120814
      //~ ,writer : new Ext.data.JsonWriter({
        //~ writeAllFields: false
        //~ ,listful: true
      //~ })
      //~ ,restful : true
    });
      
    //~ console.log('config.pk_index',config.pk_index,config.store),
    delete this.ls_store_fields;
      
    var this_ = this;
    //~ var grid = this;
    this.store.on('load', function() {
        //~ console.log('20120814 GridStore.on(load)',this_.store);
        this_.set_param_values(this_.store.reader.arrayData.param_values);
        //~ this_.set_status(this_.store.reader.arrayData.status);
        //~ 20120918
        this.getView().getRowClass = Lino.getRowClass;
        
        if (this_.store.reader.arrayData.no_data_text) {
            //~ this.viewConfig.emptyText = this_.store.reader.arrayData.no_data_text;
            this.getView().emptyText = this_.store.reader.arrayData.no_data_text;
            this.getView().refresh();
        }
        if (this_.containing_window)
            this_.set_window_title(this_.store.reader.arrayData.title);
            //~ this_.containing_window.setTitle(this_.store.reader.arrayData.title);
        if (!this.is_searching) { // disabled 20121025: quick_search_field may not lose focus
          this.is_searching = false;
          if (this_.selModel.getSelectedCell){
              if (this_.getStore().getCount()) // there may be no data
                  this_.selModel.select(0,0); 
          } else {
              this_.selModel.selectFirstRow();
              this_.getView().focusEl.focus();
          }
        } 
        //~ else console.log("is_searching -> no focussing");
        //~ var t = this.getTopToolbar();
        //~ var activePage = Math.ceil((t.cursor + t.pageSize) / t.pageSize);
        //~ this.quick_search_field.focus(); // 20121024
      }, this
    );
    var actions = Lino.build_buttons(this, this.ls_bbar_actions);
    //~ Ext.apply(config,Lino.build_buttons(this,config.ls_bbar_actions));
    //~ config.bbar, this.cmenu = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ this.cmenu = new Ext.menu.Menu({items: config.bbar});
    delete this.ls_bbar_actions
    if (actions) {
        this.cmenu = actions.cmenu;
        this.keyhandlers = actions.keyhandlers;
    }
    
    if (!this.hide_top_toolbar) {  
      var tbar = [ 
        this.quick_search_field = new Ext.form.TextField({ 
          //~ fieldLabel: "Search"
          listeners: { 
            scope:this_
            //~ ,change:this_.search_change
            
            ,render: Lino.quicktip_renderer("Quick Search","Enter a text to use as quick search filter")
            
            //~ ,keypress: this.search_keypress 
            ,blur: function() { this.is_searching = false}
          }
          ,validator:function(value) { return this_.search_validate(value) }
          //~ ,tooltip: "Enter a quick search text, then press TAB"
          //~ value: text
          //~ scope:this, 
          //~ ,enableKeyEvents: true
          //~ listeners: { keypress: this.search_keypress }, 
          //~ id: "seachString" 
      })];
      tbar = this.add_params_panel(tbar);
      var menu = [];
      var set_gc = function(index) {
        return function() {
          //~ console.log('set_gc() 20100812');
          this.getColumnModel().setConfig(
              this.apply_grid_config(index,this.ls_grid_configs,this.ls_columns));
        }
      }
      for (var i = 0; i < this.ls_grid_configs.length;i++) {
        var gc = this.ls_grid_configs[i];
        menu.push({text:gc.label,handler:set_gc(i),scope:this})
      }
      if(menu.length > 1) {
        tbar = tbar.concat([
          { text:"View",
            menu: menu,
            tooltip:"Select another view of this report"
          }
        ]);
      }
      
      if (actions) {
        tbar = tbar.concat(actions.bbar);
          //~ this.bbar = actions.bbar;
      }
      
      this.tbar = new Ext.PagingToolbar({ 
        store: this.store, 
        prependButtons: true, 
        //~ pageSize: this.page_length, 
        pageSize: 1, 
        displayInfo: true, 
        beforePageText: "Page",
        afterPageText: "of {0}",
        displayMsg: "Displaying {0} - {1} of {2}",
        firstText: "First page",
        lastText: "Last page",
        prevText: "Previous page",
        nextText: "Next page",
        items: tbar
      });
    }
      
    if (this.cell_edit) {
      this.selModel = new Ext.grid.CellSelectionModel()
      this.get_selected = function() {
        //~ console.log(this.getSelectionModel().selection);
        if (this.selModel.selection)
            return [ this.selModel.selection.record ];
        return [this.store.getAt(0)];
      };
      this.get_current_record = function() { 
        if (this.getSelectionModel().selection) 
          return this.selModel.selection.record;
        return this.store.getAt(0);
      };
    } else { 
      this.selModel = new Ext.grid.RowSelectionModel() 
      this.get_selected = function() {
        var sels = this.selModel.getSelections();
        if (sels.length == 0) sels = [this.store.getAt(0)];
        return sels
      };
      this.get_current_record = function() { 
        var rec = this.selModel.getSelected();
        if (rec == undefined) rec = this.store.getAt(0);
        return rec
      };
    };
    this.columns  = this.apply_grid_config(this.gc_name,this.ls_grid_configs,this.ls_columns);
    
    Lino.GridPanel.superclass.initComponent.call(this);
    
    this.on('resize', function(){
      //~ console.log("20120213 resize",arguments)
      this.refresh();
      },this);
    this.on('viewready', function(){
      //~ console.log("20120213 resize",arguments);
      this.view_is_ready = true;
      this.refresh(); // removed 20130911
      },this);
    this.on('afteredit', this.on_afteredit); // 20120814
    this.on('beforeedit', this.on_beforeedit);
    this.on('beforeedit',function(e) { this.before_row_edit(e.record)},this);
    if (this.cell_edit) {
        this.on('cellcontextmenu', Lino.cell_context_menu, this);
    } else {
        this.on('rowcontextmenu', Lino.row_context_menu, this);
    }
    //~ this.on('contextmenu', Lino.grid_context_menu, this);
    
    delete this.cell_edit;
    
  },
  
  //~ onResize : function(){
      //~ console.log("20120206 GridPanel.onResize",arguments);
      //~ Lino.GridPanel.superclass.onResize.apply(this, arguments);
      //~ this.refresh();
  //~ },
  
  
  get_status : function(){
    var st = { base_params : this.get_base_params()};
    if (!this.hide_top_toolbar) {
        // #866
        if (this.getStore().lastOptions != undefined && this.getStore().lastOptions.params != undefined){
            st.current_page = Math.round(this.getStore().lastOptions.params.start / this.getStore().lastOptions.params.limit ) + 1 ;
        }
    }
    st.param_values = this.status_param_values;
    //~ console.log("20120213 GridPanel.get_status",st);
    return st;
  },
  
  /* 
  Lino.GridPanel.set_status() 
  */
  set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    // console.log("20140527 GridPanel.set_status", status);
    this.clear_base_params();
    if (status == undefined) status = {base_params:{}};
    this.set_param_values(status.param_values);
    if (status.base_params) { 
      this.set_base_params(status.base_params);
    }
    if (status.show_params_panel != undefined) {
        if (this.toggle_params_panel_btn) {
            //~ this.toggle_params_panel_btn.toggle(status.show_params_panel=='true');
            this.toggle_params_panel_btn.toggle(status.show_params_panel);
        }
    }
    if (!this.hide_top_toolbar) {
      //~ console.log("20120213 GridPanel.getTopToolbar().changePage",
          //~ status.current_page || 1);
      this.getTopToolbar().changePage(status.current_page || 1);
    }
    //~ this.fireEvent('resize');
    //~ this.refresh.defer(100,this); 
    //~ this.onResize.defer(100,this); 
    //~ this.refresh(); 
    //~ this.doLayout(); 
    //~ this.onResize(); 
    //~ this.store.load();
  },
  
  refresh : function(unused) { 
    this.refresh_with_after();
  },
  /* GridPanel */
  refresh_with_after : function(after) { 
    // console.log('20140504 Lino.GridPanel.refresh '+ this.store.proxy.url);
    //~ var bp = { fmt:'json' }
    if (! this.view_is_ready) return;
    
    if (this.containing_panel) {
        //~ Ext.apply(p,this.master_panel.get_master_params());
        //~ Ext.apply(options.params,this.containing_panel.get_master_params());
        this.set_base_params(this.containing_panel.get_master_params());
        // 20130911
        if (!this.store.baseParams.mk) {  
            return;
        }
    }
    
    //~ console.log('20130911 Lino.GridPanel.refresh_with_after',this.containing_panel.get_master_params());
    
    var options = {};
    if (after) {
        options.callback = function(r,options,success) {if(success) after()}
    }
      
    //~ if (!this.rendered) {
        //~ console.log("20120206 GridPanel.refresh() must wait until rendered",options);
        //~ this.grid_panel.on('render',this.load.createDelegate(this,options))
        //~ return;
    //~ }
    // Ticket 802
    if (this.store.lastOptions != undefined){
        var params = {};
        params.limit = this.store.lastOptions.params.limit;
        params.start = this.store.lastOptions.params.start;
        options.params = params;
    }
    this.store.load(options);
  },
  
  /* pageSize depends on grid height (Trying to remove scrollbar)
  Thanks to 
  - Christophe Badoit on http://www.sencha.com/forum/showthread.php?82647
  - http://www.sencha.com/forum/archive/index.php/t-37231.html
  */
  calculatePageSize : function(second_attempt) {
    //~ if (!this.rendered) { 
    if (!this.view_is_ready) { 
      //~ console.log('Cannot calculatePageSize() : not rendered');
      return false; }
    //~ if (!this.isVisible()) { 
      //~ console.log('calculatePageSize : not visible');
      //~ return false; }
      
    //~ console.log('getFrameHeight() is',this.getFrameHeight());
    //~ console.log('getView().scroller.getHeight() is',this.getView().scroller.getHeight());
    //~ console.log('mainBody.getHeight() is',this.getView().mainBody.getHeight());
    //~ console.log('getInnerHeight() is',this.getInnerHeight());
    //~ console.log('getHeight() is',this.getHeight());
    //~ console.log('el.getHeight() is',this.getEl().getHeight());
    //~ console.log('getGridEl().getHeight() is',this.getGridEl().getHeight());
    //~ console.log('getOuterSize().height is',this.getOuterSize().height);
    //~ console.log('getBox().height is',this.getBox().height);
    //~ console.log('getResizeEl.getHeight() is',this.getResizeEl().getHeight());
    //~ console.log('getLayoutTarget().getHeight() is',this.getLayoutTarget().getHeight());
      
    // var rowHeight = this.row_height * 11; experimental value 11
    // same as in ext_renderer.py that's not enough because it is the
    // height of one text line. But here we need the outer height of a
    // grid row containing that many text lines.

    var row_content = '&nbsp;'
    for (var i = 0; i < this.row_height;i++) {
        row_content += '<br>';
    }

    var Element = Ext.Element;
    var gv = this.view;
    var fakeBody = new Element(Element.fly(gv.scroller).child('div.x-grid3-body'));
    var rowTemplate = gv.templates.row;
    var cellTemplate = gv.templates.cell;
    var tstyle  = 'width:' + gv.getGridInnerWidth() + 'px;';
    // console.log("20160615", this.fake_row_content);
    var cells = cellTemplate.apply({value:row_content});
    var markup = rowTemplate.apply({
            tstyle: tstyle,
            cols  : 1,
            cells : cells,
            alt   : ''
        });        
    fakeBody.dom.innerHTML = gv.templates.body.apply({rows: markup});
    var row = fakeBody.dom.childNodes[0];
    var rowHeight = Ext.get(row).getHeight();

    //~ console.log('rowHeight is ',rowHeight,this,caller);
    //~ this.getView().syncScroll();
    //~ this.getView().initTemplates();
    var height = this.getView().scroller.getHeight();

    //~ console.log('getView().scroller.getHeight() is',this.getView().scroller.getHeight());
    //~ console.log('getInnerHeight() - getFrameHeight() is',
      //~ this.getInnerHeight(), '-',
      //~ this.getFrameHeight(), '=',
      //~ this.getInnerHeight() - this.getFrameHeight());
    //~ var height = this.getView().mainBody.getHeight();
    //~ var height = this.getView().mainWrap.getHeight();
    //~ var height = this.getView().resizeMarker.getHeight();
    //~ this.syncSize();
    //~ var height = this.getInnerHeight() - this.getFrameHeight();
    //~ var height = this.getHeight() - this.getFrameHeight();
    height -= Ext.getScrollBarWidth(); // leave room for a possible horizontal scrollbar... 
    //~ height -= this.getView().scrollOffset;
    var ps = Math.floor(height / rowHeight);
    //~ console.log('20130816 calculatePageSize():',height,'/',rowHeight,'->',ps);
    ps -= 1; // leave room for a possible phantom row
    //~ return (ps > 1 ? ps : false);
    if (ps > 1) return ps;
    //~ console.log('calculatePageSize() found less than 1 row:',height,'/',rowHeight,'->',ps);
    //~ foo.bar = baz; // 20120213
    return 5; // preview_limit
    //~ if (second_attempt) {
        //~ console.log('calculatePageSize() abandons after second attempt:',
          //~ height,'/',rowHeight,'->',ps);
      //~ return 5;
    //~ }
    //~ return this.calculatePageSize.defer(500,this,[true]);
  },
  
  onCellDblClick : function(grid, row, col){
      //~ console.log("20120307 onCellDblClick",this,grid, row, col);
      if (this.ls_detail_handler) {
          //~ Lino.notify('show detail');
          Lino.show_detail(this);
          return false;
      }else{
        //~ console.log('startEditing');
        this.startEditing(row,col);
      }
  },
  get_base_params : function() {  /* Lino.GridPanel */
    var p = Ext.apply({}, this.store.baseParams);
    Lino.insert_subst_user(p);
    // if (this.quick_search_field)
    //     if (this.quick_search_field.getValue())
    //         p.query = this.quick_search_field.getValue();
    return p;
  },
  set_base_params : function(p) {
    // console.log('20130911 GridPanel.set_base_params',p)
    for (k in p) this.store.setBaseParam(k,p[k]);
    //~ this.store.baseParams = p;
    if (this.quick_search_field)
      this.quick_search_field.setValue(p.query || "");
    //~ if (p.param_values) 
        //~ this.set_param_values(p.param_values);  
  },
  clear_base_params : function() {
      this.store.baseParams = {};
      Lino.insert_subst_user(this.store.baseParams);
  },
  set_base_param : function(k,v) {
    this.store.setBaseParam(k,v);
  },
  
  //~ get_permalink_params : function() {
    //~ var p = {};
    //~ return p;
  //~ },
  
  before_row_edit : function(record) {},
    
  //~ search_keypress : function(){
    //~ console.log("2012124 search_keypress",arguments);
  //~ },
  search_validate : function(value) {
      if (value == this.quick_search_text) return true;

      /**
      *  Cancel the previous request when do a new load request.
      *  Prevents Ajax race conditions. Ticket #2136
      **/
      var c = this.store.proxy.getConnection();
      c.abort(c.transId);

      
    this.is_searching = true;
    //~ console.log('search_validate',value)
    this.quick_search_text = value;
    this.set_base_param('query',value); 
    //~ this.getTopToolbar().changePage(1);
    this.getTopToolbar().moveFirst();
    //~ this.refresh();
    return true;
  },
  
  search_change : function(field,oldValue,newValue) {
    //~ console.log('search_change',field.getValue(),oldValue,newValue)
    this.set_base_param('query',field.getValue()); 
    this.getTopToolbar().moveFirst();
    //~ this.refresh();
  },
  
  apply_grid_config : function(index,grid_configs,rpt_columns) {
    //~ var rpt_columns = this.ls_columns;
    var gc = grid_configs[index];    
    //~ console.log('apply_grid_config() 20100812',name,gc);
    this.gc_name = index;
    if (gc == undefined) {
      return rpt_columns;
      //~ config.columns = config.ls_columns;
      //~ return;
    } 
    //~ delete config.ls_filters
    
    //~ console.log(20100805,config.ls_columns);
    var columns = Array(gc.columns.length);
    for (var j = 0; j < rpt_columns.length;j++) {
      var col = rpt_columns[j];
      for (var i = 0; i < gc.columns.length; i++) {
        if (col.dataIndex == gc.ci[i]) {
          col.width = gc.cw[i];
          col.hidden = gc.ch[i];
          columns[i] = col;
          break;
        }
      }
    }
    
    //~ var columns = Array(rpt_columns.length);
    //~ for (var i = 0; i < rpt_columns.length; i++) {
      //~ columns[i] = rpt_columns[gc.columns[i]];
      //~ columns[i].width = gc.widths[i];
    //~ }
    
    //~ if (gc.hidden_cols) {
      //~ for (var i = 0; i < gc.hidden_cols.length; i++) {
        //~ var hc = gc.hidden_cols[i];
        //~ for (var j = 0; j < columns.length;j++) {
          //~ var col = columns[j];
          //~ if (col.dataIndex == hc) {
            //~ col.hidden = true;
            //~ break
          //~ }
        //~ }
      //~ }
    //~ }
    if (gc.filters) {
      //~ console.log(20100811,'config.ls_filters',config.ls_filters);
      //~ console.log(20100811,'config.ls_grid_config.filters',config.ls_grid_config.filters);
      for (var i = 0; i < gc.filters.length; i++) {
        var fv = gc.filters[i];
        for (var j = 0; j < columns.length;j++) {
          var col = columns[j];
          if (col.dataIndex == fv.field) {
            //~ console.log(20100811, f,' == ',fv);
            if (fv.type == 'string') {
              col.filter.value = fv.value;
              //~ if (fv.comparison !== undefined) f.comparison = fv.comparison;
            } else {
              //~ console.log(20100811, fv);
              col.filter.value = {};
              col.filter.value[fv.comparison] = fv.value;
            }
            break;
          }
        };
      }
    }
    
    return columns;
    //~ config.columns = cols;
    //~ delete config.ls_columns
  },
  
  get_current_grid_config : function () {
    var cm = this.getColumnModel();
    var widths = Array(cm.config.length);
    var hiddens = Array(cm.config.length);
    //~ var hiddens = Array(cm.config.length);
    var columns = Array(cm.config.length);
    //~ var columns = Array(cm.config.length);
    //~ var hidden_cols = [];
    //~ var filters = this.filters.getFilterValues();
    var p = this.filters.buildQuery(this.filters.getFilterData())
    for (var i = 0; i < cm.config.length; i++) {
      var col = cm.config[i];
      columns[i] = col.dataIndex;
      //~ hiddens[i] = col.hidden;
      widths[i] = col.width;
      hiddens[i] = col.hidden;
      //~ if (col.hidden) hidden_cols.push(col.dataIndex);
    }
    //~ p['hidden_cols'] = hidden_cols;
    p.cw = widths;
    p.ch = hiddens;
    p.ci = columns;
    //~ p['widths'] = widths;
    //~ p['hiddens'] = hiddens;
    //~ p['columns'] = columns;
    p['name'] = this.gc_name;
    //~ var gc = this.ls_grid_configs[this.gc_name];
    //~ if (gc !== undefined) 
        //~ p['label'] = gc.label
    //~ console.log('20100810 save_grid_config',p);
    return p;
  },
  
  unused_manage_grid_configs : function() {
    var data = [];
    for (k in this.ls_grid_configs) {
      var v = this.ls_grid_configs[k];
      var i = [k,String(v.columns),String(v.hidden_cols),String(v.filters)];
      data.push(i)
    }
    if (this.ls_grid_configs[this.gc_name] == undefined) {
      var v = this.get_current_grid_config();
      var i = [k,String(v.columns),String(v.hidden_cols),String(v.filters)];
      data.push(i);
    }
    //~ console.log(20100811, data);
    var main = new Ext.grid.GridPanel({
      store: new Ext.data.ArrayStore({
        idIndex:0,
        fields:['name','columns','hidden_cols','filters'],
        autoDestroy:true,
        data: data}),
      //~ autoHeight:true,
      selModel: new Ext.grid.RowSelectionModel(),
      listeners: { 
        rowdblclick: function(grid,rowIndex,e) {
          console.log('row doubleclicked',grid, rowIndex,e);
        },
        rowclick: function(grid,rowIndex,e) {
          console.log('row clicked',grid, rowIndex,e);
        }
      },
      columns: [ 
        {dataIndex:'name',header:'Name'}, 
        {dataIndex:'columns',header:'columns'}, 
        {dataIndex:'hidden_cols',header:'hidden columns'}, 
        {dataIndex:'filters',header:'filters'} 
      ]
    });
    var win = new Ext.Window({title:'GridConfigs Manager',layout:'fit',items:main,height:200});
    win.show();
  },
  
  unused_edit_grid_config : function(name) {
    gc = this.ls_grid_configs[name];
    var win = new Ext.Window({
      title:'Edit Grid Config',layout:'vbox', 
      //~ layoutConfig:'stretch'
      items:[
        {xtype:'text', value: gc.name},
        {xtype:'text', value: gc.columns},
        {xtype:'text', value: gc.hidden_cols},
        {xtype:'text', value: gc.filters}
      ]
    });
    win.show();
  },
  
  unused_save_grid_config : function () {
    //~ console.log('TODO: save_grid_config',this);
    //~ p.column_widths = Ext.pluck(this.colModel.columns,'width');
    var a = { 
      params:this.get_current_grid_config(), 
      method:'PUT',
      url:'/grid_config' + this.ls_url,
      success: Lino.action_handler(this),
      scope: this,
      failure: Lino.ajax_error_handler(this)
    };
    this.loadMask.show(); // 20120211
    Ext.Ajax.request(a);
    //~ Lino.do_action(this,a);
  },
  
  on_beforeedit : function(e) {
    //~ console.log('20130128 GridPanel.on_beforeedit()',e,e.record.data.disable_editing);
    if(this.disable_editing | e.record.data.disable_editing) {
      e.cancel = true;
      Lino.notify("This record is disabled");
      return;
    }
    if(e.record.data.disabled_fields && e.record.data.disabled_fields[e.field]) {
      e.cancel = true;
      Lino.notify("This field is disabled");
      return;
    }
    //~ if (e.record.data.disabled_fields) {
      //~ for (i in e.record.data.disabled_fields) {
        //~ if(e.record.data.disabled_fields[i] == e.field) {
          //~ e.cancel = true;
          //~ Lino.notify(String.format('Field "{0}" is disabled for this record',e.field));
          //~ return
        //~ }
      //~ }
    //~ }
  },
  save_grid_data : function() {
      //~ console.log("20120814 save_grid_data");
      this.getStore().commitChanges();
  },
  on_afteredit : function(e) {
    /*
    e.grid - The grid that fired the event
    e.record - The record being edited
    e.field - The field name being edited
    e.value - The value being set
    e.originalValue - The original value for the field, before the edit.
    e.row - The grid row index
    e.column - The grid column index
    */
    var p = {};
    // console.log('20140403 afteredit: ',e.record);
    //~ console.log('20101130 value: ',e.value);
    //~ var p = e.record.getChanges();
    //~ console.log('20101130 getChanges: ',e.record.getChanges());
    //~ this.before_row_edit(e.record);

    for(k in e.record.getChanges()) {
        var v = e.record.get(k);
    //~ for(k in e.record.modified) {
        //~ console.log('20101130',k,'=',v);
        //~ var cm = e.grid.getColumnModel();
        //~ var di = cm.getDataIndex(k);
        var f = e.record.fields.get(k);
        //~ console.log('20101130 f = ',f);
        //~ var v = e.record.get(di);
        if (f.type.type == 'date') {
            p[k] = Ext.util.Format.date(v, f.dateFormat);
        }else{
            p[k] = v;
            var v = e.record.get(k+'Hidden');
            if (v !== undefined) {
              p[k+'Hidden'] = v;
            }
        }
    }
    // add value used by ForeignKeyStoreField CHOICES_HIDDEN_SUFFIX
    // not sure whether this is still needed:
    p[e.field+'Hidden'] = e.value;
    //~ p.su = Lino.subst_user;
    Lino.insert_subst_user(p);
    // this one is needed so that this field can serve as choice context:
    e.record.data[e.field+'Hidden'] = e.value;
    // p[pk] = e.record.data[pk];
    // console.log("grid_afteredit:",e.field,'=',e.value);
    Ext.apply(p, this.get_base_params()); // needed for POST, ignored for PUT
    //~ Ext.apply(p,this.containing_window.config.base_params);
    //~ 20121109 p['$constants.URL_PARAM_ACTION_NAME'] = 'grid';
    var self = this;
    var req = {
        params:p,
        waitMsg: 'Saving your data...',
        success: Lino.action_handler( this, function(result) {
          // console.log("20140728 afteredit.success got ", result);
          //~ if (result.data_record) {
          if (result.refresh_all) {
              var cw = self.get_containing_window();
              if (cw) {
                  cw.main_item.refresh();
              }
              else console.log("20120123 cannot refresh_all",self);
          } else if (result.rows) {
              //~ self.getStore().loadData(result,true);
              var r = self.getStore().reader.readRecords(result);
              if (e.record.phantom) {
                  // console.log("20140728 gonna call Store.insert()", self.getStore(), e.row, r.records);
                  self.getStore().insert(e.row, r.records);
              }else{
                  // console.log("20140728 afteredit.success doUpdate", r.records[0]);
                  self.getStore().doUpdate(r.records[0]);
              }
              self.getStore().rejectChanges(); 
              /* 
              get rid of the red triangles without saving the record again
              */
              //~ self.getStore().commitChanges(); // get rid of the red triangles
          } else {
              self.getStore().commitChanges(); // get rid of the red triangles
              self.getStore().reload();        // reload our datastore.
          }
          }),
        scope: this,
        failure: Lino.ajax_error_handler(this)
    };
    if (e.record.phantom) {
      req.params.an = 'grid_post'; // CreateRow.action_name
      Ext.apply(req,{
        method: 'POST',
        url: '/api' + this.ls_url
      });
    } else {
      req.params.an = 'grid_put'; // SaveRow.action_name
      Ext.apply(req,{
        method: 'PUT',
        url: '/api' + this.ls_url + '/' + e.record.id
      });
    }
    //~ console.log('20110406 on_afteredit',req);
    this.loadMask.show(); // 20120211
    Ext.Ajax.request(req);
  },

  afterRender : function() {
    Lino.GridPanel.superclass.afterRender.call(this);
    // this.getView().mainBody.focus();
    // console.log(20100114,this.getView().getRows());
    // if (this.getView().getRows().length > 0) {
    //  this.getView().focusRow(1);
    // }
    //~ this.my_load_mask = new Ext.LoadMask(this.getEl(), {
        //~ msg:'$_("Please wait...")',
        //~ store:this.store});
      
    var tbar = this.getTopToolbar();
    // tbar.on('change',function() {this.getView().focusRow(1);},this);
    // tbar.on('change',function() {this.getSelectionModel().selectFirstRow();this.getView().mainBody.focus();},this);
    // tbar.on('change',function() {this.getView().mainBody.focus();},this);
    // tbar.on('change',function() {this.getView().focusRow(1);},this);
    this.nav = new Ext.KeyNav(this.getEl(),{
      pageUp: function() {tbar.movePrevious(); },
      pageDown: function() {tbar.moveNext(); },
      home: function() {tbar.moveFirst(); },
      end: function() {tbar.moveLast(); },
      scope: this
    });

  },
  after_delete : function() {
    //~ console.log('Lino.GridPanel.after_delete');
    this.refresh();
  },
  add_row_listener : function(fn,scope) {
    this.getSelectionModel().addListener('rowselect',fn,scope);
  },
  postEditValue : function(value, originalValue, r, field){
    value = Lino.GridPanel.superclass.postEditValue.call(this,value,originalValue,r,field);
    //~ console.log('GridPanel.postEdit()',value, originalValue, r, field);
    return value;
  },
  
  set_start_value : function(v) {
      this.start_value = v;
  },
  preEditValue : function(r, field){
      if (this.start_value) {
        var v = this.start_value;
        delete this.start_value;
        this.activeEditor.selectOnFocus = false;
        return v;
      }
      var value = r.data[field];
      return this.autoEncode && Ext.isString(value) ? Ext.util.Format.htmlDecode(value) : value;
  },
  
  on_master_changed : function() {
    //~ if (! this.enabled) return;
    //~ cmp = this;
    //~ console.log('20130911 Lino.GridPanel.on_master_changed()',this.title,this.rendered);
    if (! this.rendered) return; // 20120213
    var todo = function() {
      if (this.disabled) return;
      //~ if (this.disabled) return;
      //~ if (this.enabled) {
          //~ var src = caller.config.url_data + "/" + record.id + ".jpg"
          //~ console.log(20111125, this.containing_window);
          //~ for (k in p) this.getStore().setBaseParam(k,p[k]);
          //~ console.log('Lino.GridPanel.on_master_changed()',this.title,p);
          this.refresh();
          //~ this.set_base_params(this.master_panel.get_master_params());
          //~ this.getStore().load(); 
      //~ }
    };
    Lino.do_when_visible(this,todo.createDelegate(this));
  },
  load_record_id : function(record_id,after) {
      Lino.run_detail_handler(this,record_id)
  }
  
});
  

//~ Lino.MainPanelMixin = {
  //~ tbar_items : function() {
      //~ return ;
  //~ }
//~ };

//~ Ext.override(Lino.GridPanel,Lino.MainPanelMixin);
//~ Ext.override(Lino.FormPanel,Lino.MainPanelMixin);

//~ Lino.grid_context_menu = function(e) {
  //~ console.log('contextmenu',arguments);
//~ }

Lino.row_context_menu = function(grid,row,col,e) {
  console.log('20130927 rowcontextmenu',grid,row,col,e,grid.store.reader.arrayData.rows[row]);
}

Lino.cell_context_menu = function(grid,row,col,e) {
  //~ console.log('20120531 cellcontextmenu',grid,row,col,e,grid.store.reader.arrayData.rows[row]);
  e.stopEvent();
  //~ grid.getView().focusCell(row,col);
  grid.getSelectionModel().select(row,col);
  //~ console.log(grid.store.getAt(row));
  //~ grid.getView().focusRow(row);
  //~ return;
  if(!grid.cmenu.el){grid.cmenu.render(); }
  //~ if(e.record.data.disabled_fields) {

  if (grid.disabled_fields_index) {
      var da = grid.store.reader.arrayData.rows[row][grid.disabled_fields_index];
      if (da) {
          this.cmenu.cascade(function(item){ 
            //~ console.log(20120531, item.itemId, da[item.itemId]);
            if (da[item.itemId]) item.disable(); else item.enable();
          });
      }
  };
  
  var xy = e.getXY();
  xy[1] -= grid.cmenu.el.getHeight();
  grid.cmenu.showAt(xy);
}


Lino.chooser_handler = function(combo,name) {
  return function(cmp, newValue, oldValue) {
    //~ console.log('Lino.chooser_handler()',cmp,oldValue,newValue);
    combo.setContextValue(name, newValue);
  }
};



Lino.ComboBox = Ext.extend(Ext.form.ComboBox,{
  forceSelection: "yes but select on tab",
  // forceSelection: true,
  triggerAction: 'all',
  minListWidth:280, // 20131022
  autoSelect: false,
  selectOnFocus: true, // select any existing text in the field immediately on focus.
  submitValue: true,
  displayField: 'text', // 'text', 
  valueField: 'value', // 'value',
  
  //~ initComponent : Ext.form.ComboBox.prototype.initComponent.createSequence(function() {
  initComponent : function(){
      this.contextParams = {};
      //~ Ext.form.ComboBox.initComponent(this);
      Lino.ComboBox.superclass.initComponent.call(this);
  },
  setValue : function(v, record_data){
      /*
      Based on feature request developed in http://extjs.net/forum/showthread.php?t=75751
      */
      /* `record_data` is used to get the text corresponding to this value */
      //~ if(this.name == 'city') 
      //~ console.log('20120203', this.name,'.setValue(', v ,') this=', this,'record_data=',record_data);
      var text = v;
      if(this.valueField){
        if(v == null || v == '') { 
            //~ if (this.name == 'birth_country') 
                //~ console.log(this.name,'.setValue',v,'no lookup needed, value is empty');
            //~ v = undefined;
            v = '';
            //~ text = '';
        } else if (Ext.isDefined(record_data)) {
          text = record_data[this.name];
          //~ if (this.name == 'birth_country') 
            //~ console.log(this.name,'.setValue',v,'got text ',text,' from record ',record);
        } else {
          // if(this.mode == 'remote' && !Ext.isDefined(this.store.totalLength)){
          if(this.mode == 'remote' && ( this.lastQuery === null || (!Ext.isDefined(this.store.totalLength)))){
              //~ if (this.name == 'birth_country') console.log(this.name,'.setValue',v,'store not yet loaded');
              this.store.on('load', this.setValue.createDelegate(this, arguments), null, {single: true});
              if(this.store.lastOptions === null || this.lastQuery === null){
                  var params;
                  if(this.valueParam){
                      params = {};
                      params[this.valueParam] = v;
                  }else{
                      var q = this.allQuery;
                      this.lastQuery = q;
                      this.store.setBaseParam(this.queryParam, q);
                      params = this.getParams(q);
                  }
                  //~ if (this.name == 'birth_country') 
                    //~ console.log(this.name,'.setValue',v,' : call load() with params ',params);
                  this.store.load({params: params});
              //~ }else{
                  //~ if (this.name == 'birth_country') 
                    //~ console.log(this.name,'.setValue',v,' : but store is loading',this.store.lastOptions);
              }
              return;
          //~ }else{
              //~ if (this.name == 'birth_country') 
                //~ console.log(this.name,'.setValue',v,' : store is loaded, lastQuery is "',this.lastQuery,'"');
          }
          var r = this.findRecord(this.valueField, v);
          if(r){
              text = r.data[this.displayField];
          }else if(this.valueNotFoundText !== undefined){
              text = this.valueNotFoundText;
          }
        }
      }
      this.lastSelectionText = text;
      //~ this.lastSelectionText = v;
      if(this.hiddenField){
          //~ this.hiddenField.originalValue = v;
          this.hiddenField.value = v;
      }
      Ext.form.ComboBox.superclass.setValue.call(this, text);
      this.value = v; // needed for grid.afteredit
  },
  
  getParams : function(q){
    // p = Ext.form.ComboBox.superclass.getParams.call(this, q);
    // causes "Ext.form.ComboBox.superclass.getParams is undefined"
    var p = {};
    if(this.pageSize){
        p['start'] = 0;
        p['limit'] = this.pageSize;
    }
    // now my code:
    if(this.contextParams) Ext.apply(p, this.contextParams);
    return p;
  },
  setContextValue : function(name,value) {
    //~ console.log('setContextValue',this,this.name,':',name,'=',value);
    //~ if (this.contextValues === undefined) {
        //~ this.contextValues = Array(); // this.contextParams.length);
    //~ }
    if (this.contextParams[name] != value) {
      //~ console.log('setContextValue 1',this.contextParams);
      this.contextParams[name] = value;
      this.lastQuery = null;
      //~ console.log('setContextValue 2',this.contextParams);
    }
  }
});

Lino.ChoicesFieldElement = Ext.extend(Lino.ComboBox,{
  mode: 'local'
});


Lino.SimpleRemoteComboStore = Ext.extend(Ext.data.JsonStore,{
  // forceSelection: true,  20140206 why was this here?
  constructor: function(config){
      Lino.SimpleRemoteComboStore.superclass.constructor.call(this, Ext.apply(config, {
          totalProperty: 'count',
          root: 'rows',
          id: 'value', // 'value'
          fields: ['value' ], 
          listeners: { exception: Lino.on_store_exception }
      }));
  }
});

Lino.ComplexRemoteComboStore = Ext.extend(Ext.data.JsonStore,{
  constructor: function(config){
      Lino.ComplexRemoteComboStore.superclass.constructor.call(this, Ext.apply(config, {
          totalProperty: 'count',
          root: 'rows',
          id: 'value', // constants.CHOICES_VALUE_FIELD
          fields: ['value','text'], // constants.CHOICES_VALUE_FIELD, // constants.CHOICES_TEXT_FIELD
          listeners: { exception: Lino.on_store_exception }
      }));
  }
});

Lino.RemoteComboFieldElement = Ext.extend(Lino.ComboBox,{
  mode: 'remote',
  //~ forceSelection:false,
  minChars: 2, // default 4 is too much
  queryDelay: 300, // default 500 is maybe slow
  queryParam: 'query', 
  //~ typeAhead: true,
  //~ selectOnFocus: true, // select any existing text in the field immediately on focus.
  resizable: true
  ,initList : function() {
      Lino.RemoteComboFieldElement.superclass.initList.call(this);
      if (this.pageTb) {
          
          var me = this;
          this.pageTb.on("beforechange", function(toolbar, o){
              if(me.contextParams)
                  Ext.apply(o, me.contextParams);
          });
          
          //~ 
          //~ var btn = ls_buttons
          //~ this.pageTb.items = this.pageTb.items.concat([btn]);
          //~ console.log("20131022 pageTb.items is", this.pageTb.items)
      }
  }
});

/*
Thanks to Animal for posting the basic idea:
http://www.sencha.com/forum/showthread.php?15842-2.0-SOLVED-Combobox-twintrigger-clear&p=76130&viewfull=1#post76130

*/
Lino.TwinCombo = Ext.extend(Lino.RemoteComboFieldElement,{
    trigger2Class : 'x-form-search-trigger',
    //~ trigger2Class : 'x-tbar-detail',
    initComponent : function() {
        //~ Lino.TwinCombo.superclass.initComponent.call(this);
        Lino.ComboBox.prototype.initComponent.call(this);
        Ext.form.TwinTriggerField.prototype.initComponent.call(this);
    },
    onTrigger2Click : function() {
        //~ console.log('onTrigger2Click',this,arguments);
    }
  });
//~ Lino.TwinCombo.prototype.initComponent = Ext.form.TwinTriggerField.prototype.initComponent;
Lino.TwinCombo.prototype.getTrigger = Ext.form.TwinTriggerField.prototype.getTrigger;
Lino.TwinCombo.prototype.getOuterSize = Ext.form.TwinTriggerField.prototype.getOuterSize;
Lino.TwinCombo.prototype.initTrigger = Ext.form.TwinTriggerField.prototype.initTrigger;
Lino.TwinCombo.prototype.onTrigger1Click = Ext.form.ComboBox.prototype.onTriggerClick;
//~ Lino.TwinCombo.prototype.onTrigger2Click = function() {
    //~ console.log('onTrigger2Click',arguments);
//~ };



Lino.SimpleRemoteComboFieldElement = Ext.extend(Lino.RemoteComboFieldElement,{
  displayField: 'value', 
  valueField: null,
  forceSelection: false
});




Lino.Window = Ext.extend(Ext.Window,{
  //~ layout: "fit", 
  closeAction : 'hide',
  renderTo: 'main_area', 
  constrain: true,
  maximized: true,
  draggable: false,
  width: 700,
  height: 500,
  maximizable: false,
  constructor : function (config) {
    if (config.main_item.params_panel) {
        config.layout = 'border';
        config.main_item.region = 'center';
        config.main_item.params_panel.region = 'north';
        //~ config.main_item.params_panel.autoHeight = false; // 20130924
        config.main_item.params_panel.hidden = config.main_item.params_panel_hidden;
        config.items = [config.main_item.params_panel, config.main_item];
        //~ 20130923b
    } else {
        config.layout = 'fit';
        config.items = config.main_item;
    }
    this.main_item = config.main_item; 

    if (typeof config.width == "string" && config.width.slice(-1) == "%") {
        config.width = Lino.perc2width(parseInt(config.width.slice(0, -1)));
    }
    
    delete config.main_item;
    //~ delete config.params_item;
    
    //~ this.main_item = config.items.get(0);
    this.main_item.containing_window = this;
    
    //~ console.log('20120110 Lino.Window.constructor() 1');
    //~ if (Lino.current_window) { // all windows except the top are closable
    if (this.main_item.hide_window_title) { 
      config.closable = false;
      config.frame = false;
      config.shadow = false;
      //~ config.border = true;
      //~ config.title = undefined;
      //~ config.tools = null;
      delete config.title;
      delete config.tools;
    } else {
      config.title = this.main_item.empty_title;
      config.closable = true;
      config.tools = [ 
        { qtip: 'permalink', handler: Lino.permalink_handler(this), id: "pin" }
      ];
      if (this.main_item.content_type && this.main_item.action_name != 'insert') {
        config.tools = [ {
          handler: Lino.help_text_editor,
          qtip: "Edit help texts for fields on this model.",
          scope: this.main_item,
          id: "gear"
        }].concat(config.tools);
      }
        
    //~ { qtip: '', handler: Lino.save_wc_handler(this), id: "save" }, 
    //~ { qtip: this.config.qtip, handler: Lino.save_wc_handler(this), id: "save" }, 
    //~ { qtip: 'Call doLayout() on main Container.', handler: Lino.refresh_handler(this), id: "refresh" },
    //~ if (this.main_item.params_panel) {
        //~ config.tools = config.tools.concat([ 
          //~ { qtip: 'Show/hide parameter panel', handler: this.toggle_params_panel, id: "gear", scope:this } 
        //~ ]);
    //~ }
    //~ if (config.closable !== false) {
      // if undefined, will take default behaviour
      //~ config.tools = config.tools.concat([ 
        //~ { qtip: 'close', handler: this.hide, id: "close", scope:this } 
      //~ ]);
    }
    
    this.main_item.config_containing_window(config);
    
    // console.log('20150514 Lino.Window.constructor() 2');
    Lino.Window.superclass.constructor.call(this, config);
    
    //~ console.log('20120110 Lino.Window.constructor() 3');
    
  },
  initComponent : function() {
    this.main_item.init_containing_window(this);
    Lino.Window.superclass.initComponent.call(this);
  
  },
  hide : function() { 
      this.main_item.do_when_clean(false,function() { 
        Lino.close_window(); });
  },
  hide_really : function() { 
    Lino.Window.superclass.hide.call(this);
  },
  onRender : function(ct, position){
    // console.log('20140829 Lino.Window.onRender() 1');
    Lino.Window.superclass.onRender.call(this, ct, position);
    var main_area = Ext.getCmp('main_area')
    //~ console.log('20120110 Lino.Window.onRender() 2');
  
    this.on('show', function(win) {
        // console.log('20140829 Lino.Window.on(show) : add resize handler');
        main_area.on('resize', win.onWindowResize, win);
    });
    this.on('hide', function(win) {
        // console.log('20140829 Lino.Window.on(hide) : remove resize handler');
        main_area.un('resize', win.onWindowResize, win);
    });
    // console.log('20140829 Lino.Window.onRender() 3');
  }
});


Ext.override(Ext.form.BasicForm,{
    my_loadRecord : function(record_data){
    //~ loadRecord : function(record){
        /* Same as ExtJS's loadRecord() (setValues()), except that we
        forward also the record_data to field.setValue(). This second
        parameter is used by Lino.Combobox.
        */
        //~ console.log('20120918 my_loadRecord', record_data)
        if(Ext.isArray(record_data)){ 
            for(var i = 0, len = record_data.length; i < len; i++){
                var v = record_data[i];
                var f = this.findField(v.id);
                if(f){
                    f.setValue(v.value, record_data);
                    if(this.trackResetOnLoad){
                        f.originalValue = f.getValue();
                    }
                }
            }
        }else{ 
            var field, id;
            for(id in record_data){
                if(!Ext.isFunction(record_data[id]) && (field = this.findField(id))){
                    field.setValue(record_data[id], record_data);
                    if(this.trackResetOnLoad){
                        field.originalValue = field.getValue();
                        //~ if (field.hiddenField) {
                          //~ field.hiddenField.originalValue = field.hiddenField.value;
                        //~ }
                    }
                }
            }
        }
        return this;
    }
});




function initializeFooBarDropZone(cmp) {
    //~ console.log('initializeFooBarDropZone',cmp);
    cmp.dropTarget = new Ext.dd.DropTarget(cmp.bwrap, {
      //~ ddGroup     : 'gridDDGroup',
      notifyEnter : function(ddSource, e, data) {
        console.log('notifyEnter',ddSource,e,data);
        //Add some flare to invite drop.
        cmp.body.stopFx();
        cmp.body.highlight();
      },
      notifyDrop  : function(ddSource, e, data){
        console.log('notifyDrop',ddSource,e,data);
        // Reference the record (single selection) for readability
        //~ var selectedRecord = ddSource.dragData.selections[0];


        // Load the record into the form
        //~ formPanel.getForm().my_loadRecord(selectedRecord);


        // Delete record from the grid.  not really required.
        //~ ddSource.grid.store.remove(selectedRecord);

        return(true);
      }
    })
}



Lino.show_mti_child = function(fieldname,detail_handler) {
  //~ console.log('show_mti_child',this);
  //~ console.log('show_mti_child',panel.find("main_area"));
  rec = Lino.current_window.main_item.get_current_record();
  //~ rec = panel.get_current_record();
  if (rec) {
    //~ console.log('show_mti_child',Lino.current_window,rec);
    if (rec.phantom) {
      Lino.notify('Not allowed on phantom record.');
    }else if (rec.data[fieldname]) {
      //~ console.log('show_mti_child',rec.id);
      //~ detail_handler(Lino.current_window.main_item,{},{record_id:rec.id});
      detail_handler.run(null,{record_id:rec.id});
      //~ window.open(urlroot + '/' + rec.id);
      //~ document.location = urlroot + '/' + rec.id;
      //~ window.open(urlroot + '/' + rec.id,'_blank');
    } else {
      Lino.alert("Cannot show MTI child if checkbox is off.");
    }
  } else {
    Lino.notify('No current record.');
  }
};


/*
captureEvents utility by Aaron Conran
<http://www.sencha.com/learn/grid-faq/>

Ext.onReady(function(){
    var grid = new Ext.grid.GridPanel({
        ... 
    });
    captureEvents(grid);
});
*/
function captureEvents(observable) {
    Ext.util.Observable.capture(
        observable,
        function(eventName) {
            console.info(eventName);
        },
        this
    );		
}

// settings.SITE.get_plugin_snippets()



Lino.main_menu = [ { "menu": { "items": [ { "handler": function() {Lino.about.About.show.run(null,{ "record_id": -99998 })}, "listeners": { "render": Lino.quicktip_renderer("Foo","Show information about this site.") }, "text": "About" } ] }, "text": "Site" }, { "menu": { "items": [ { "handler": function() {Lino.client.Client1s.grid.run(null)}, "text": "client1s" }, { "handler": function() {Lino.client.Products.grid.run(null)}, "text": "products" }, { "handler": function() {Lino.client.Deliverys.grid.run(null)}, "text": "deliverys" } ] }, "text": "Client" }, { "handler": function() {Lino.handle_home_button()}, "text": "Home" } ];
Ext.namespace('Lino.client.Client1s')
Ext.namespace('Lino.client.Products')
Ext.namespace('Lino.client.Deliverys')
Ext.namespace('Lino.about.SiteSearch')
Ext.namespace('Lino.about.About')
Ext.namespace('Lino.about.TimeZones')

// ChoiceLists: 
Lino.about.TimeZones = [ [ "01", "UTC" ] ];

Lino.client.Client1s.merge_row_ActionFormPanel = Ext.extend(Lino.ActionFormPanel,{
  autoScroll: false,
  autoHeight: true,
  border: false,
  layout: "form",
  labelWidth: 0,
  hideCheckBoxLabels: true,
  frame: true,
  bodyBorder: false,
  labelAlign: "top",
  action_name: 'merge_row',
  ls_url: "/client/Client1s",
  window_title: "Merge",
  before_row_edit : function(record) {
  },
  autoHeight: true,
  initComponent : function() {
    this.merge_to1 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a client1...", "fieldLabel": "into...", "hiddenName": "merge_toHidden", "listeners": { "render": Lino.quicktip_renderer("into...","(Merge.merge_to) ") }, "name": "merge_to", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Client1s.detail,Lino.client.Client1s.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/apchoices/client/Client1s/merge_row/merge_to" }) }) });
    this.reason2 = new Ext.form.TextField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "fieldLabel": "Reason", "listeners": { "render": Lino.quicktip_renderer("Reason","(Merge.reason) ") }, "maxLength": 100, "name": "reason", "selectOnFocus": true });
    this.items = [ { "anchor": "-20", "autoHeight": true, "items": this.merge_to1, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": this.reason2, "labelAlign": "top", "layout": "form", "xtype": "panel" } ];
    this.fields = [ this.merge_to1, this.reason2 ];
    Lino.client.Client1s.merge_row_ActionFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Deliverys.merge_row_ActionFormPanel = Ext.extend(Lino.ActionFormPanel,{
  autoScroll: false,
  autoHeight: true,
  border: false,
  layout: "form",
  labelWidth: 0,
  hideCheckBoxLabels: true,
  frame: true,
  bodyBorder: false,
  labelAlign: "top",
  action_name: 'merge_row',
  ls_url: "/client/Deliverys",
  window_title: "Merge",
  before_row_edit : function(record) {
  },
  autoHeight: true,
  initComponent : function() {
    this.merge_to11 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a delivery...", "fieldLabel": "into...", "hiddenName": "merge_toHidden", "listeners": { "render": Lino.quicktip_renderer("into...","(Merge.merge_to) ") }, "name": "merge_to", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Deliverys.detail,Lino.client.Deliverys.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/apchoices/client/Deliverys/merge_row/merge_to" }) }) });
    this.reason12 = new Ext.form.TextField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "fieldLabel": "Reason", "listeners": { "render": Lino.quicktip_renderer("Reason","(Merge.reason) ") }, "maxLength": 100, "name": "reason", "selectOnFocus": true });
    this.items = [ { "anchor": "-20", "autoHeight": true, "items": this.merge_to11, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": this.reason12, "labelAlign": "top", "layout": "form", "xtype": "panel" } ];
    this.fields = [ this.merge_to11, this.reason12 ];
    Lino.client.Deliverys.merge_row_ActionFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Products.merge_row_ActionFormPanel = Ext.extend(Lino.ActionFormPanel,{
  autoScroll: false,
  autoHeight: true,
  border: false,
  layout: "form",
  labelWidth: 0,
  hideCheckBoxLabels: true,
  frame: true,
  bodyBorder: false,
  labelAlign: "top",
  action_name: 'merge_row',
  ls_url: "/client/Products",
  window_title: "Merge",
  before_row_edit : function(record) {
  },
  autoHeight: true,
  initComponent : function() {
    this.merge_to6 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a product...", "fieldLabel": "into...", "hiddenName": "merge_toHidden", "listeners": { "render": Lino.quicktip_renderer("into...","(Merge.merge_to) ") }, "name": "merge_to", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Products.detail,Lino.client.Products.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/apchoices/client/Products/merge_row/merge_to" }) }) });
    this.reason7 = new Ext.form.TextField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "fieldLabel": "Reason", "listeners": { "render": Lino.quicktip_renderer("Reason","(Merge.reason) ") }, "maxLength": 100, "name": "reason", "selectOnFocus": true });
    this.items = [ { "anchor": "-20", "autoHeight": true, "items": this.merge_to6, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": this.reason7, "labelAlign": "top", "layout": "form", "xtype": "panel" } ];
    this.fields = [ this.merge_to6, this.reason7 ];
    Lino.client.Products.merge_row_ActionFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Deliverys.DetailFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  initComponent : function() {
    var client116 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a client1...", "fieldLabel": "client1", "hiddenName": "client1Hidden", "listeners": { "render": Lino.quicktip_renderer("client1","(client.Deliverys.client1) ") }, "name": "client1", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Client1s.detail,Lino.client.Client1s.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/client1" }) }) });
    var product17 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a product...", "fieldLabel": "product", "hiddenName": "productHidden", "listeners": { "render": Lino.quicktip_renderer("product","(client.Deliverys.product) ") }, "name": "product", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Products.detail,Lino.client.Products.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/product" }) }) });
    var designation18 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Designation", "listeners": { "render": Lino.quicktip_renderer("Designation","(client.Deliverys.designation) ") }, "maxLength": 200, "name": "designation", "selectOnFocus": true });
    var price19 = new Ext.form.NumberField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "decimalPrecision": 2, "decimalSeparator": ",", "fieldLabel": "Price", "listeners": { "render": Lino.quicktip_renderer("Price","(client.Deliverys.price) ") }, "name": "price", "selectOnFocus": true });
    var main_panel20 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "anchor": "-20", "autoHeight": true, "items": client116, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product17, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": designation18, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": price19, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel20;
    this.before_row_edit = function(record) {
    }
    Lino.client.Deliverys.DetailFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Deliverys.InsertFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  autoHeight: true,
  initComponent : function() {
    var client125 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a client1...", "fieldLabel": "client1", "hiddenName": "client1Hidden", "listeners": { "render": Lino.quicktip_renderer("client1","(client.Deliverys.client1) ") }, "name": "client1", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Client1s.detail,Lino.client.Client1s.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/client1" }) }) });
    var product26 = new Lino.TwinCombo({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "emptyText": "Select a product...", "fieldLabel": "product", "hiddenName": "productHidden", "listeners": { "render": Lino.quicktip_renderer("product","(client.Deliverys.product) ") }, "name": "product", "onTrigger2Click": function(e){ Lino.show_fk_detail(this,Lino.client.Products.detail,Lino.client.Products.insert)}, "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/product" }) }) });
    var designation27 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Designation", "listeners": { "render": Lino.quicktip_renderer("Designation","(client.Deliverys.designation) ") }, "maxLength": 200, "name": "designation", "selectOnFocus": true });
    var price28 = new Ext.form.NumberField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "decimalPrecision": 2, "decimalSeparator": ",", "fieldLabel": "Price", "listeners": { "render": Lino.quicktip_renderer("Price","(client.Deliverys.price) ") }, "name": "price", "selectOnFocus": true });
    var main_panel29 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "anchor": "-20", "autoHeight": true, "items": client125, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product26, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": designation27, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": price28, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel29;
    this.before_row_edit = function(record) {
    }
    Lino.client.Deliverys.InsertFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Products.InsertFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  autoHeight: true,
  initComponent : function() {
    var product_name34 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Product ", "listeners": { "render": Lino.quicktip_renderer("Product ","(client.Products.product_name) ") }, "maxLength": 50, "name": "product_name", "selectOnFocus": true });
    var product_type35 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Product Type", "listeners": { "render": Lino.quicktip_renderer("Product Type","(client.Products.product_type) ") }, "maxLength": 50, "name": "product_type", "selectOnFocus": true });
    var product_price36 = new Ext.form.NumberField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "decimalPrecision": 2, "decimalSeparator": ",", "fieldLabel": "Price", "listeners": { "render": Lino.quicktip_renderer("Price","(client.Products.product_price) ") }, "name": "product_price", "selectOnFocus": true });
    var main_panel37 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "anchor": "-20", "autoHeight": true, "items": product_name34, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product_type35, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product_price36, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel37;
    this.before_row_edit = function(record) {
    }
    Lino.client.Products.InsertFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Client1s.InsertFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  autoHeight: true,
  initComponent : function() {
    var first_name41 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "First name", "listeners": { "render": Lino.quicktip_renderer("First name","(client.Client1s.first_name) ") }, "maxLength": 50, "name": "first_name", "selectOnFocus": true });
    var address42 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Address", "listeners": { "render": Lino.quicktip_renderer("Address","(client.Client1s.address) ") }, "maxLength": 50, "name": "address", "selectOnFocus": true });
    var main_panel43 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "anchor": "-20", "autoHeight": true, "items": first_name41, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": address42, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel43;
    this.before_row_edit = function(record) {
    }
    Lino.client.Client1s.InsertFormPanel.superclass.initComponent.call(this);
  }
});


Lino.about.About.DetailFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  disable_editing: true,
  initComponent : function() {
    var server_status_disp47 = new Ext.form.DisplayField({ "always_enabled": true, "anchor": "-20", "autoHeight": true, "disabled": true, "fieldLabel": "Server status", "listeners": { "render": Lino.quicktip_renderer("Server status","(about.About.server_status) ") }, "name": "server_status", "value": "<br/>" });
    var main_panel48 = new Ext.Panel({ "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "flex": 25, "html": "<div class=\"htmlText\"><span>This is <b>yet another Lino application</b> using <a href=\"http://www.lino-framework.org\" target=\"_blank\">Lino</a> 18.3.0, <a href=\"http://www.djangoproject.com\" target=\"_blank\">Django</a> 1.11.11, <a href=\"http://www.python.org/\" target=\"_blank\">Python</a> 2.7.14, <a href=\"http://babel.edgewall.org/\" target=\"_blank\">Babel</a> 2.5.3, <a href=\"http://jinja.pocoo.org/\" target=\"_blank\">Jinja</a> 2.10, <a href=\"http://labix.org/python-dateutil\" target=\"_blank\">python-dateutil</a> 2.7.0, <a href=\"http://getbootstrap.com\" target=\"_blank\">Bootstrap</a> 3.3.4, <a href=\"http://www.sencha.com\" target=\"_blank\">ExtJS</a> <a href=\"#\" onclick=\"alert('ExtJS client version is ' + Ext.version);\" title=\"Click to see ExtJS client version\">(version)</a>, <a href=\"http://www.famfamfam.com/lab/icons/silk/\" target=\"_blank\">Silk Icons</a> 1.3</span><p>Languages: en-us</p><p>Server uptime : <b>4/3/18 at 10:05</b> (None)</p><p>This is a Lino demo site.</p><p>Source timestamps:</p><ul><li>lino : <b>3/24/18 at 12:09</b></li><li>atelier : <b>3/24/18 at 12:17</b></li><li>django : <b>3/27/18 at 22:44</b></li><li>client : <b>4/3/18 at 10:05</b></li></ul></div>", "xtype": "label" }, { "autoHeight": true, "items": server_status_disp47, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "vbox", "layoutConfig": { "align": "stretch" } });
    this.items = main_panel48;
    this.before_row_edit = function(record) {
    }
    Lino.about.About.DetailFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Client1s.DetailFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  initComponent : function() {
    var id50 = new Ext.form.NumberField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "ID", "listeners": { "render": Lino.quicktip_renderer("ID","(client.Client1s.id) ") }, "name": "id", "selectOnFocus": true });
    var first_name51 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "First name", "listeners": { "render": Lino.quicktip_renderer("First name","(client.Client1s.first_name) ") }, "maxLength": 50, "name": "first_name", "selectOnFocus": true });
    var main_1_panel52 = new Ext.Panel({ "anchor": "-20", "autoHeight": true, "autoScroll": false, "border": false, "frame": false, "hideCheckBoxLabels": true, "items": [ { "autoHeight": true, "flex": 19, "items": id50, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "autoHeight": true, "flex": 80, "items": first_name51, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "hbox", "layoutConfig": { "align": "stretchmax" } });
    var address55 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Address", "listeners": { "render": Lino.quicktip_renderer("Address","(client.Client1s.address) ") }, "maxLength": 50, "name": "address", "selectOnFocus": true });
    var main_panel56 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ main_1_panel52, { "anchor": "-20", "autoHeight": true, "items": address55, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel56;
    this.before_row_edit = function(record) {
    }
    Lino.client.Client1s.DetailFormPanel.superclass.initComponent.call(this);
  }
});


Lino.client.Products.DetailFormPanel = Ext.extend(Lino.FormPanel,{
  layout: 'fit',
  auto_save: true,
  initComponent : function() {
    var product_name58 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Product ", "listeners": { "render": Lino.quicktip_renderer("Product ","(client.Products.product_name) ") }, "maxLength": 50, "name": "product_name", "selectOnFocus": true });
    var product_type59 = new Ext.form.TextField({ "anchor": "-20", "autoHeight": true, "fieldLabel": "Product Type", "listeners": { "render": Lino.quicktip_renderer("Product Type","(client.Products.product_type) ") }, "maxLength": 50, "name": "product_type", "selectOnFocus": true });
    var product_price60 = new Ext.form.NumberField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "decimalPrecision": 2, "decimalSeparator": ",", "fieldLabel": "Price", "listeners": { "render": Lino.quicktip_renderer("Price","(client.Products.product_price) ") }, "name": "product_price", "selectOnFocus": true });
    var product_qt61 = new Ext.form.NumberField({ "allowBlank": false, "anchor": "-20", "autoHeight": true, "fieldLabel": "Quantity", "listeners": { "render": Lino.quicktip_renderer("Quantity","(client.Products.product_qt) ") }, "name": "product_qt", "selectOnFocus": true });
    var main_panel62 = new Ext.Panel({ "autoHeight": true, "autoScroll": false, "bodyBorder": false, "border": false, "frame": true, "hideCheckBoxLabels": true, "items": [ { "anchor": "-20", "autoHeight": true, "items": product_name58, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product_type59, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product_price60, "labelAlign": "top", "layout": "form", "xtype": "panel" }, { "anchor": "-20", "autoHeight": true, "items": product_qt61, "labelAlign": "top", "layout": "form", "xtype": "panel" } ], "labelAlign": "top", "labelWidth": 0, "layout": "form" });
    this.items = main_panel62;
    this.before_row_edit = function(record) {
    }
    Lino.client.Products.DetailFormPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Client1s.merge_row = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(50) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Client1s.merge_row_ActionFormPanel({});
});
Lino.client.Products.merge_row = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(50) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Products.merge_row_ActionFormPanel({});
});
Lino.client.Deliverys.merge_row = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(50) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Deliverys.merge_row_ActionFormPanel({});
});

// js_render_GridPanel_class client.Client1s
Lino.client.Client1s.GridPanel = Ext.extend(Lino.GridPanel,{
  disabled_fields_index : 6,
  viewConfig : { "emptyText": "No data to display.", "forceFit": true, "getRowClass": Lino.getRowClass },
  ls_url : "/client/Client1s",
  ls_bbar_actions : [ { "auto_save": true, "iconCls": "x-tbar-html", "itemId": "show_as_html", "menu_item_text": "HTML", "overflowText": "HTML", "panel_btn_handler": Lino.list_action_handler('/client/Client1s','show_as_html','GET',Lino.get_current_grid_config), "tooltip": "Show this table in Bootstrap3 interface" }, { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": true, "iconCls": "x-tbar-application_form", "itemId": "detail", "menu_item_text": "Detail", "overflowText": "Detail", "panel_btn_handler": Lino.show_detail, "tooltip": "Detail" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Client1s.merge_row), "tooltip": "Merge" } ],
  cell_edit : true,
  title : "client1s",
  page_length : 20,
  params_panel_hidden : true,
  stripeRows : true,
  ls_store_fields : [ { "name": "id", "type": "int" }, { "name": "first_name" }, { "name": "address" }, { "name": "workflow_buttons" }, { "name": "mobile_item" }, { "name": "overview" }, { "name": "disabled_fields" }, { "name": "disable_editing" } ],
  pk_index : 0,
  ls_grid_configs : [  ],
  ls_id_property : "id",
  gc_name : 0,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Client1s.detail;
    this.ls_insert_handler = Lino.client.Client1s.insert;
    var ww = this.containing_window;
    var id67 = new Ext.form.NumberField({ "selectOnFocus": true });
    var first_name68 = new Ext.form.TextField({ "maxLength": 50, "selectOnFocus": true });
    var address69 = new Ext.form.TextField({ "maxLength": 50, "selectOnFocus": true });
    var workflow_buttons_disp70 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var mobile_item_disp71 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var overview_htmlbox72 = new Lino.HtmlBoxPanel({ "always_enabled": true, "bodyStyle": "overflow-x:hidden;", "containing_panel": this, "hidden": true, "items": new Ext.BoxComponent({autoScroll:true}), "layout": "fit", "name": "overview", "title": "Description", "value": "<br/>" });
    this.before_row_edit = function(record) {
      overview_htmlbox72.refresh();
    };
    this.ls_columns = [ { "align": "right", "colIndex": 0, "dataIndex": "id", "editable": true, "editor": id67, "filter": { "type": "numeric" }, "format": "0", "header": "ID", "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.id) ") }, "sortable": true, "width": Lino.chars2width(6), "xtype": "numbercolumn" }, { "colIndex": 1, "dataIndex": "first_name", "editable": true, "editor": first_name68, "filter": { "type": "string" }, "header": "First name", "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.first_name) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 2, "dataIndex": "address", "editable": true, "editor": address69, "filter": { "type": "string" }, "header": "Address", "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.address) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 3, "dataIndex": "workflow_buttons", "editable": false, "header": "Workflow", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.workflow_buttons) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 4, "dataIndex": "mobile_item", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.mobile_item) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 5, "dataIndex": "overview", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Client1s.overview) ") }, "sortable": false, "width": Lino.chars2width(31) } ];
    Lino.client.Client1s.GridPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Client1s.show_as_html = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "show_as_html", params, Lino.get_current_grid_config);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Client1s.grid_post = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "grid_post", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Client1s.grid_put = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "grid_put", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Client1s.insertPanel = Ext.extend(Lino.client.Client1s.InsertFormPanel,{
  empty_title: "New",
  hide_navigator: true,
  params_panel_hidden: true,
  save_action_name: "submit_insert",
  ls_bbar_actions: [ { "auto_save": false, "itemId": "submit_insert", "listeners": { "render": Lino.quicktip_renderer('a2btn',"Create the record and open a detail window on it") }, "menu_item_text": "Create", "overflowText": "Create", "panel_btn_handler": function(panel){panel.save()}, "text": "Create" } ],
  ls_url: "/client/Client1s",
  action_name: "insert",
  default_record_id: -99999,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Client1s.detail;
    this.ls_insert_handler = Lino.client.Client1s.insert;
    Lino.client.Client1s.insertPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Client1s.insert = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(60) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Client1s.insertPanel(p);
});
Lino.client.Client1s.submit_detail = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "submit_detail", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Client1s.submit_insert = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "submit_insert", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Client1s.detailPanel = Ext.extend(Lino.client.Client1s.DetailFormPanel,{
  empty_title: "Detail",
  params_panel_hidden: true,
  save_action_name: "submit_detail",
  ls_bbar_actions: [ { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": false, "iconCls": "x-tbar-disk", "itemId": "submit_detail", "menu_item_text": "Save", "overflowText": "Save", "panel_btn_handler": function(panel){panel.save()}, "tooltip": "Save changes in this form" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Client1s.merge_row), "tooltip": "Merge" } ],
  ls_url: "/client/Client1s",
  action_name: "detail",
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Client1s.detail;
    this.ls_insert_handler = Lino.client.Client1s.insert;
    Lino.client.Client1s.detailPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Client1s.detail = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Client1s.detailPanel(p);
});
Lino.client.Client1s.delete_selected = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "delete_selected", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Client1s.grid = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Client1s.GridPanel(p);
});
Lino.client.Client1s.validate = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Client1s", "GET", pk, "validate", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

// js_render_GridPanel_class client.Products
Lino.client.Products.GridPanel = Ext.extend(Lino.GridPanel,{
  disabled_fields_index : 8,
  viewConfig : { "emptyText": "No data to display.", "forceFit": true, "getRowClass": Lino.getRowClass },
  ls_url : "/client/Products",
  ls_bbar_actions : [ { "auto_save": true, "iconCls": "x-tbar-html", "itemId": "show_as_html", "menu_item_text": "HTML", "overflowText": "HTML", "panel_btn_handler": Lino.list_action_handler('/client/Products','show_as_html','GET',Lino.get_current_grid_config), "tooltip": "Show this table in Bootstrap3 interface" }, { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": true, "iconCls": "x-tbar-application_form", "itemId": "detail", "menu_item_text": "Detail", "overflowText": "Detail", "panel_btn_handler": Lino.show_detail, "tooltip": "Detail" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Products.merge_row), "tooltip": "Merge" } ],
  cell_edit : true,
  title : "products",
  page_length : 20,
  params_panel_hidden : true,
  stripeRows : true,
  ls_store_fields : [ { "name": "id", "type": "int" }, { "name": "product_name" }, { "name": "product_type" }, { "name": "product_price" }, { "name": "product_qt", "type": "int", "useNull": true }, { "name": "workflow_buttons" }, { "name": "mobile_item" }, { "name": "overview" }, { "name": "disabled_fields" }, { "name": "disable_editing" } ],
  pk_index : 0,
  ls_grid_configs : [  ],
  ls_id_property : "id",
  gc_name : 0,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Products.detail;
    this.ls_insert_handler = Lino.client.Products.insert;
    var ww = this.containing_window;
    var id74 = new Ext.form.NumberField({ "selectOnFocus": true });
    var product_name75 = new Ext.form.TextField({ "maxLength": 50, "selectOnFocus": true });
    var product_type76 = new Ext.form.TextField({ "maxLength": 50, "selectOnFocus": true });
    var product_price77 = new Ext.form.NumberField({ "allowBlank": false, "decimalPrecision": 2, "decimalSeparator": ",", "selectOnFocus": true });
    var product_qt78 = new Ext.form.NumberField({ "allowBlank": false, "selectOnFocus": true });
    var workflow_buttons_disp79 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var mobile_item_disp80 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var overview_htmlbox81 = new Lino.HtmlBoxPanel({ "always_enabled": true, "bodyStyle": "overflow-x:hidden;", "containing_panel": this, "hidden": true, "items": new Ext.BoxComponent({autoScroll:true}), "layout": "fit", "name": "overview", "title": "Description", "value": "<br/>" });
    this.before_row_edit = function(record) {
      overview_htmlbox81.refresh();
    };
    this.ls_columns = [ { "align": "right", "colIndex": 0, "dataIndex": "id", "editable": true, "editor": id74, "filter": { "type": "numeric" }, "format": "0", "header": "ID", "listeners": { "render": Lino.quicktip_renderer("","(client.Products.id) ") }, "sortable": true, "width": Lino.chars2width(6), "xtype": "numbercolumn" }, { "colIndex": 1, "dataIndex": "product_name", "editable": true, "editor": product_name75, "filter": { "type": "string" }, "header": "Product ", "listeners": { "render": Lino.quicktip_renderer("","(client.Products.product_name) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 2, "dataIndex": "product_type", "editable": true, "editor": product_type76, "filter": { "type": "string" }, "header": "Product Type", "listeners": { "render": Lino.quicktip_renderer("","(client.Products.product_type) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "align": "right", "colIndex": 3, "dataIndex": "product_price", "editable": true, "editor": product_price77, "filter": { "type": "numeric" }, "format": "0.000,00/i", "header": "Price", "listeners": { "render": Lino.quicktip_renderer("","(client.Products.product_price) ") }, "sortable": true, "width": Lino.chars2width(13), "xtype": "numbercolumn" }, { "align": "right", "colIndex": 4, "dataIndex": "product_qt", "editable": true, "editor": product_qt78, "filter": { "type": "numeric" }, "format": "0", "header": "Quantity", "listeners": { "render": Lino.quicktip_renderer("","(client.Products.product_qt) ") }, "sortable": true, "width": Lino.chars2width(6), "xtype": "numbercolumn" }, { "colIndex": 5, "dataIndex": "workflow_buttons", "editable": false, "header": "Workflow", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Products.workflow_buttons) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 6, "dataIndex": "mobile_item", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Products.mobile_item) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 7, "dataIndex": "overview", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Products.overview) ") }, "sortable": false, "width": Lino.chars2width(31) } ];
    Lino.client.Products.GridPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Products.show_as_html = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "show_as_html", params, Lino.get_current_grid_config);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Products.grid_post = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "grid_post", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Products.grid_put = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "grid_put", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Products.insertPanel = Ext.extend(Lino.client.Products.InsertFormPanel,{
  empty_title: "New",
  hide_navigator: true,
  params_panel_hidden: true,
  save_action_name: "submit_insert",
  ls_bbar_actions: [ { "auto_save": false, "itemId": "submit_insert", "listeners": { "render": Lino.quicktip_renderer('a2btn',"Create the record and open a detail window on it") }, "menu_item_text": "Create", "overflowText": "Create", "panel_btn_handler": function(panel){panel.save()}, "text": "Create" } ],
  ls_url: "/client/Products",
  action_name: "insert",
  default_record_id: -99999,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Products.detail;
    this.ls_insert_handler = Lino.client.Products.insert;
    Lino.client.Products.insertPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Products.insert = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(60) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Products.insertPanel(p);
});
Lino.client.Products.submit_detail = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "submit_detail", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Products.submit_insert = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "submit_insert", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Products.detailPanel = Ext.extend(Lino.client.Products.DetailFormPanel,{
  empty_title: "Detail",
  params_panel_hidden: true,
  save_action_name: "submit_detail",
  ls_bbar_actions: [ { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": false, "iconCls": "x-tbar-disk", "itemId": "submit_detail", "menu_item_text": "Save", "overflowText": "Save", "panel_btn_handler": function(panel){panel.save()}, "tooltip": "Save changes in this form" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Products.merge_row), "tooltip": "Merge" } ],
  ls_url: "/client/Products",
  action_name: "detail",
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Products.detail;
    this.ls_insert_handler = Lino.client.Products.insert;
    Lino.client.Products.detailPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Products.detail = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Products.detailPanel(p);
});
Lino.client.Products.delete_selected = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "delete_selected", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Products.grid = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Products.GridPanel(p);
});
Lino.client.Products.validate = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Products", "GET", pk, "validate", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

// js_render_GridPanel_class client.Deliverys
Lino.client.Deliverys.GridPanel = Ext.extend(Lino.GridPanel,{
  disabled_fields_index : 10,
  viewConfig : { "emptyText": "No data to display.", "forceFit": true, "getRowClass": Lino.getRowClass },
  ls_url : "/client/Deliverys",
  ls_bbar_actions : [ { "auto_save": true, "iconCls": "x-tbar-html", "itemId": "show_as_html", "menu_item_text": "HTML", "overflowText": "HTML", "panel_btn_handler": Lino.list_action_handler('/client/Deliverys','show_as_html','GET',Lino.get_current_grid_config), "tooltip": "Show this table in Bootstrap3 interface" }, { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": true, "iconCls": "x-tbar-application_form", "itemId": "detail", "menu_item_text": "Detail", "overflowText": "Detail", "panel_btn_handler": Lino.show_detail, "tooltip": "Detail" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Deliverys.merge_row), "tooltip": "Merge" } ],
  cell_edit : true,
  title : "deliverys",
  page_length : 20,
  params_panel_hidden : true,
  stripeRows : true,
  ls_store_fields : [ { "name": "id", "type": "int" }, { "name": "client1" }, 'client1Hidden', { "name": "product" }, 'productHidden', { "name": "designation" }, { "name": "price" }, { "name": "workflow_buttons" }, { "name": "mobile_item" }, { "name": "overview" }, { "name": "disabled_fields" }, { "name": "disable_editing" } ],
  pk_index : 0,
  ls_grid_configs : [  ],
  ls_id_property : "id",
  gc_name : 0,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Deliverys.detail;
    this.ls_insert_handler = Lino.client.Deliverys.insert;
    var ww = this.containing_window;
    var id83 = new Ext.form.NumberField({ "selectOnFocus": true });
    var client184 = new Lino.RemoteComboFieldElement({ "allowBlank": false, "emptyText": "Select a client1...", "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/client1" }) }) });
    var product85 = new Lino.RemoteComboFieldElement({ "allowBlank": false, "emptyText": "Select a product...", "pageSize": 20, "selectOnFocus": true, "store": new Lino.ComplexRemoteComboStore({ "proxy": new Ext.data.HttpProxy({ "method": "GET", "url": "/choices/client/Deliverys/product" }) }) });
    var designation86 = new Ext.form.TextField({ "maxLength": 200, "selectOnFocus": true });
    var price87 = new Ext.form.NumberField({ "allowBlank": false, "decimalPrecision": 2, "decimalSeparator": ",", "selectOnFocus": true });
    var workflow_buttons_disp88 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var mobile_item_disp89 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var overview_htmlbox90 = new Lino.HtmlBoxPanel({ "always_enabled": true, "bodyStyle": "overflow-x:hidden;", "containing_panel": this, "hidden": true, "items": new Ext.BoxComponent({autoScroll:true}), "layout": "fit", "name": "overview", "title": "Description", "value": "<br/>" });
    this.before_row_edit = function(record) {
      overview_htmlbox90.refresh();
    };
    this.ls_columns = [ { "align": "right", "colIndex": 0, "dataIndex": "id", "editable": true, "editor": id83, "filter": { "type": "numeric" }, "format": "0", "header": "ID", "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.id) ") }, "sortable": true, "width": Lino.chars2width(6), "xtype": "numbercolumn" }, { "colIndex": 1, "dataIndex": "client1", "editable": true, "editor": client184, "filter": { "type": "string" }, "header": "client1", "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.client1) ") }, "renderer": Lino.fk_renderer('client1Hidden','Lino.client.Client1s.detail'), "sortable": false, "width": Lino.chars2width(21) }, { "colIndex": 2, "dataIndex": "product", "editable": true, "editor": product85, "filter": { "type": "string" }, "header": "product", "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.product) ") }, "renderer": Lino.fk_renderer('productHidden','Lino.client.Products.detail'), "sortable": false, "width": Lino.chars2width(21) }, { "colIndex": 3, "dataIndex": "designation", "editable": true, "editor": designation86, "filter": { "type": "string" }, "header": "Designation", "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.designation) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "align": "right", "colIndex": 4, "dataIndex": "price", "editable": true, "editor": price87, "filter": { "type": "numeric" }, "format": "0.000,00/i", "header": "Price", "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.price) ") }, "sortable": true, "width": Lino.chars2width(13), "xtype": "numbercolumn" }, { "colIndex": 5, "dataIndex": "workflow_buttons", "editable": false, "header": "Workflow", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.workflow_buttons) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 6, "dataIndex": "mobile_item", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.mobile_item) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 7, "dataIndex": "overview", "editable": false, "header": "Description", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(client.Deliverys.overview) ") }, "sortable": false, "width": Lino.chars2width(31) } ];
    Lino.client.Deliverys.GridPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Deliverys.show_as_html = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "show_as_html", params, Lino.get_current_grid_config);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Deliverys.grid_post = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "grid_post", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Deliverys.grid_put = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "grid_put", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Deliverys.insertPanel = Ext.extend(Lino.client.Deliverys.InsertFormPanel,{
  empty_title: "New",
  hide_navigator: true,
  params_panel_hidden: true,
  save_action_name: "submit_insert",
  ls_bbar_actions: [ { "auto_save": false, "itemId": "submit_insert", "listeners": { "render": Lino.quicktip_renderer('a2btn',"Create the record and open a detail window on it") }, "menu_item_text": "Create", "overflowText": "Create", "panel_btn_handler": function(panel){panel.save()}, "text": "Create" } ],
  ls_url: "/client/Deliverys",
  action_name: "insert",
  default_record_id: -99999,
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Deliverys.detail;
    this.ls_insert_handler = Lino.client.Deliverys.insert;
    Lino.client.Deliverys.insertPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Deliverys.insert = new Lino.WindowAction({ "autoHeight": true, "draggable": true, "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(60) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.client.Deliverys.insertPanel(p);
});
Lino.client.Deliverys.submit_detail = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "submit_detail", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Deliverys.submit_insert = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "submit_insert", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

Lino.client.Deliverys.detailPanel = Ext.extend(Lino.client.Deliverys.DetailFormPanel,{
  empty_title: "Detail",
  params_panel_hidden: true,
  save_action_name: "submit_detail",
  ls_bbar_actions: [ { "auto_save": true, "iconCls": "x-tbar-add", "itemId": "insert", "keycode": 44, "menu_item_text": "New", "overflowText": "New", "panel_btn_handler": Lino.show_insert, "tooltip": "Insert a new record" }, { "auto_save": false, "iconCls": "x-tbar-disk", "itemId": "submit_detail", "menu_item_text": "Save", "overflowText": "Save", "panel_btn_handler": function(panel){panel.save()}, "tooltip": "Save changes in this form" }, { "auto_save": false, "iconCls": "x-tbar-delete", "itemId": "delete_selected", "keycode": 46, "menu_item_text": "Delete", "overflowText": "Delete", "panel_btn_handler": Lino.row_action_handler('delete_selected','GET',null), "tooltip": "Delete this record" }, { "auto_save": true, "iconCls": "x-tbar-arrow_join", "itemId": "merge_row", "menu_item_text": "Merge", "overflowText": "Merge", "panel_btn_handler": Lino.param_action_handler(Lino.client.Deliverys.merge_row), "tooltip": "Merge" } ],
  ls_url: "/client/Deliverys",
  action_name: "detail",
  initComponent : function() {
    this.ls_detail_handler = Lino.client.Deliverys.detail;
    this.ls_insert_handler = Lino.client.Deliverys.insert;
    Lino.client.Deliverys.detailPanel.superclass.initComponent.call(this);
  }
});

Lino.client.Deliverys.detail = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Deliverys.detailPanel(p);
});
Lino.client.Deliverys.delete_selected = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "delete_selected", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.client.Deliverys.grid = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.client.Deliverys.GridPanel(p);
});
Lino.client.Deliverys.validate = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/client/Deliverys", "GET", pk, "validate", params, null);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};

// js_render_GridPanel_class about.SiteSearch
Lino.about.SiteSearch.GridPanel = Ext.extend(Lino.GridPanel,{
  ls_url : "/about/SiteSearch",
  ls_bbar_actions : [ { "auto_save": true, "iconCls": "x-tbar-html", "itemId": "show_as_html", "menu_item_text": "HTML", "overflowText": "HTML", "panel_btn_handler": Lino.list_action_handler('/about/SiteSearch','show_as_html','GET',Lino.get_current_grid_config), "tooltip": "Show this table in Bootstrap3 interface" } ],
  cell_edit : true,
  title : "Search",
  page_length : 20,
  params_panel_hidden : true,
  gc_name : 0,
  disable_editing : true,
  ls_store_fields : [ { "name": "description" }, { "name": "matches" } ],
  stripeRows : true,
  ls_grid_configs : [  ],
  viewConfig : { "emptyText": "No data to display.", "forceFit": true },
  initComponent : function() {
    var ww = this.containing_window;
    var description_disp92 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "value": "<br/>" });
    var matches_disp93 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "value": "<br/>" });
    this.before_row_edit = function(record) {
    };
    this.ls_columns = [ { "colIndex": 0, "dataIndex": "description", "editable": false, "header": "Description", "listeners": { "render": Lino.quicktip_renderer("","(about.SiteSearch.description) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 1, "dataIndex": "matches", "editable": false, "header": "Matches", "listeners": { "render": Lino.quicktip_renderer("","(about.SiteSearch.matches) ") }, "sortable": false, "width": Lino.chars2width(31) } ];
    Lino.about.SiteSearch.GridPanel.superclass.initComponent.call(this);
  }
});

Lino.about.SiteSearch.show_as_html = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/about/SiteSearch", "GET", pk, "show_as_html", params, Lino.get_current_grid_config);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.about.SiteSearch.grid = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.about.SiteSearch.GridPanel(p);
});

Lino.about.About.showPanel = Ext.extend(Lino.about.About.DetailFormPanel,{
  empty_title: "About",
  hide_navigator: true,
  params_panel_hidden: true,
  save_action_name: "submit_detail",
  ls_bbar_actions: [  ],
  ls_url: "/about/About",
  initComponent : function() {
    this.ls_detail_handler = Lino.about.About.show;
    Lino.about.About.showPanel.superclass.initComponent.call(this);
  }
});

Lino.about.About.show = new Lino.WindowAction({ "draggable": true, "height": Lino.rows2height(20), "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(60) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.about.About.showPanel(p);
});

Lino.about.About.showPanel = Ext.extend(Lino.about.About.DetailFormPanel,{
  empty_title: "About",
  hide_navigator: true,
  params_panel_hidden: true,
  save_action_name: "submit_detail",
  ls_bbar_actions: [  ],
  ls_url: "/about/About",
  initComponent : function() {
    this.ls_detail_handler = Lino.about.About.show;
    Lino.about.About.showPanel.superclass.initComponent.call(this);
  }
});

Lino.about.About.show = new Lino.WindowAction({ "draggable": true, "height": Lino.rows2height(20), "maximizable": true, "maximized": false, "modal": true, "width": Lino.chars2width(60) }, function(){
  var p = { "hide_top_toolbar": true, "is_main_window": true };
  return new Lino.about.About.showPanel(p);
});

// js_render_GridPanel_class about.TimeZones
Lino.about.TimeZones.GridPanel = Ext.extend(Lino.GridPanel,{
  viewConfig : { "emptyText": "No data to display.", "forceFit": true },
  ls_url : "/about/TimeZones",
  ls_bbar_actions : [ { "auto_save": true, "iconCls": "x-tbar-html", "itemId": "show_as_html", "menu_item_text": "HTML", "overflowText": "HTML", "panel_btn_handler": Lino.list_action_handler('/about/TimeZones','show_as_html','GET',Lino.get_current_grid_config), "tooltip": "Show this table in Bootstrap3 interface" } ],
  cell_edit : true,
  title : "Time zones",
  page_length : 20,
  params_panel_hidden : true,
  stripeRows : true,
  disable_editing : true,
  ls_store_fields : [ { "name": "value" }, { "name": "name" }, { "name": "text" }, { "name": "remark" }, { "name": "detail_pointer" }, { "name": "type" }, { "name": "None" } ],
  pk_index : 0,
  ls_grid_configs : [  ],
  ls_id_property : null,
  gc_name : 0,
  initComponent : function() {
    var ww = this.containing_window;
    var value95 = new Ext.form.TextField({ "disabled": true, "maxLength": 20 });
    var name96 = new Ext.form.TextField({ "disabled": true, "maxLength": 20 });
    var text97 = new Ext.form.TextField({ "disabled": true, "maxLength": 50 });
    var remark_disp98 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var detail_pointer_disp99 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    var type_disp100 = new Ext.form.DisplayField({ "always_enabled": true, "disabled": true, "hidden": true, "value": "<br/>" });
    this.before_row_edit = function(record) {
    };
    this.ls_columns = [ { "colIndex": 0, "dataIndex": "value", "editable": false, "header": "value", "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.value) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 1, "dataIndex": "name", "editable": false, "header": "name", "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.name) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 2, "dataIndex": "text", "editable": false, "header": "text", "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.text) ") }, "sortable": true, "width": Lino.chars2width(22) }, { "colIndex": 3, "dataIndex": "remark", "editable": false, "header": "Remark", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.remark) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 4, "dataIndex": "detail_pointer", "editable": false, "header": "Details", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.detail_pointer) ") }, "sortable": false, "width": Lino.chars2width(31) }, { "colIndex": 5, "dataIndex": "type", "editable": false, "header": "Type", "hidden": true, "listeners": { "render": Lino.quicktip_renderer("","(about.TimeZones.type) ") }, "sortable": false, "width": Lino.chars2width(31) } ];
    Lino.about.TimeZones.GridPanel.superclass.initComponent.call(this);
  }
});

Lino.about.TimeZones.show_as_html = function(rp, is_main, pk, params) { 
  var h = function() { 
    Lino.run_row_action(rp, is_main, "/about/TimeZones", "GET", pk, "show_as_html", params, Lino.get_current_grid_config);
  };
  var panel = Ext.getCmp(rp);
  if(panel) panel.do_when_clean(true, h); else h();
};
Lino.about.TimeZones.grid = new Lino.WindowAction({  }, function(){
  var p = { "is_main_window": true };
  return new Lino.about.TimeZones.GridPanel(p);
});
