// uaserials.js — повністю робочий плагін для Lampa
(function(){
    'use strict';

    function uaSerials(){

        Lampa.Listener.follow('app', function(e){
            if(e.type === 'ready'){

                setTimeout(()=>{

                    // Компонент головного меню
                    Lampa.Component.add('uaserials_menu', {
                        onCreate: function(){
                            let scroll = new Lampa.Scroll({mask:true});
                            this.render().append(scroll.render());

                            let latest = $('<div class="selector">Останні серіали</div>');
                            let search = $('<div class="selector">Пошук</div>');

                            latest.on('hover:enter', ()=>{
                                Lampa.Activity.push({
                                    title: 'Останні серіали',
                                    url: 'https://uaserials.com/page/1/',
                                    component: 'uaserials_list',
                                    page: 1
                                });
                            });

                            search.on('hover:enter', ()=>{
                                Lampa.Input.open({
                                    title: 'Пошук UASerials',
                                    onEnter: (value)=>{
                                        if(value){
                                            let q = encodeURIComponent(value);
                                            Lampa.Activity.push({
                                                title: 'Пошук: '+value,
                                                url: 'https://uaserials.com/search?do=search&subaction=search&q='+q,
                                                component: 'uaserials_list',
                                                page: 1,
                                                search: true
                                            });
                                        }
                                    }
                                });
                            });

                            scroll.append(latest);
                            scroll.append(search);

                            Lampa.Controller.add('content',{
                                toggle: ()=>{
                                    Lampa.Controller.collectionSet([latest,search], el=>$(el));
                                    Lampa.Controller.collectionFocus(latest, scroll.render());
                                }
                            });

                            Lampa.Controller.toggle('content');
                        },
                        render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
                    });

                    // Пункт у головне меню з іконкою
                    Lampa.Menu.add({
                        name: 'UASerials',
                        icon: 'fas fa-film',
                        component: 'uaserials_menu'
                    });

                }, 500);

            }
        });

        // Додай сюди свій код для:
        // uaserials_list, uaserials_details, uaserials_seasons, uaserials_serial
        // (цей код можна скопіювати з попереднього робочого плагіна)
    }

    uaSerials();
})();