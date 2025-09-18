// uaserials.js — повний плагін для Lampa 1.12.2
(function(){
    'use strict';

    function uaSerials(){

        // =======================
        // Головний компонент меню
        // =======================
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

        // =======================
        // Додаємо пункт у меню після рендеру головного меню
        // =======================
        Lampa.Listener.follow('menu', function(e){
            if(e.type === 'render'){
                if(!Lampa.Menu.list.find(i=>i.component==='uaserials_menu')){
                    Lampa.Menu.list.unshift({
                        name: 'UASerials',
                        icon: 'fas fa-film',
                        component: 'uaserials_menu'
                    });
                    Lampa.Menu.render();
                    Lampa.Menu.update();
                }
            }
        });

        // =======================
        // Компонент списку серіалів
        // =======================
        Lampa.Component.add('uaserials_list', {
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                let container = $('<div class="list"></div>');
                scroll.append(container);

                this.load = (url, search=false)=>{
                    fetch(url)
                        .then(res=>res.text())
                        .then(html=>{
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(html, 'text/html');
                            let items = doc.querySelectorAll('.shortstory');
                            container.empty();
                            items.forEach(item=>{
                                let title = item.querySelector('.zagolovok a').textContent.trim();
                                let link = item.querySelector('.zagolovok a').href;
                                let el = $(`<div class="selector">${title}</div>`);
                                el.on('hover:enter', ()=>{
                                    Lampa.Activity.push({
                                        title: title,
                                        url: link,
                                        component: 'uaserials_details'
                                    });
                                });
                                container.append(el);
                            });
                        });
                };

                if(this.params){
                    this.load(this.params.url, this.params.search);
                }

                Lampa.Controller.add('content',{
                    toggle: ()=>{
                        Lampa.Controller.collectionSet(container.children(), el=>$(el));
                        Lampa.Controller.collectionFocus(container.children().first(), scroll.render());
                    }
                });

                Lampa.Controller.toggle('content');
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

        // =======================
        // Компонент деталей серіалу
        // =======================
        Lampa.Component.add('uaserials_details', {
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                let container = $('<div class="list"></div>');
                scroll.append(container);

                this.load = (url)=>{
                    fetch(url)
                        .then(res=>res.text())
                        .then(html=>{
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(html, 'text/html');
                            let seasons = doc.querySelectorAll('.shortstory a');
                            container.empty();
                            seasons.forEach(season=>{
                                let title = season.textContent.trim();
                                let link = season.href;
                                let el = $(`<div class="selector">${title}</div>`);
                                el.on('hover:enter', ()=>{
                                    Lampa.Activity.push({
                                        title: title,
                                        url: link,
                                        component: 'uaserials_seasons'
                                    });
                                });
                                container.append(el);
                            });
                        });
                };

                if(this.params){
                    this.load(this.params.url);
                }

                Lampa.Controller.add('content',{
                    toggle: ()=>{
                        Lampa.Controller.collectionSet(container.children(), el=>$(el));
                        Lampa.Controller.collectionFocus(container.children().first(), scroll.render());
                    }
                });

                Lampa.Controller.toggle('content');
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

        // =======================
        // Компонент сезонів
        // =======================
        Lampa.Component.add('uaserials_seasons', {
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                let container = $('<div class="list"></div>');
                scroll.append(container);

                this.load = (url)=>{
                    fetch(url)
                        .then(res=>res.text())
                        .then(html=>{
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(html, 'text/html');
                            let episodes = doc.querySelectorAll('.shortstory a');
                            container.empty();
                            episodes.forEach(ep=>{
                                let title = ep.textContent.trim();
                                let link = ep.href;
                                let el = $(`<div class="selector">${title}</div>`);
                                el.on('hover:enter', ()=>{
                                    Lampa.Activity.push({
                                        title: title,
                                        url: link,
                                        component: 'uaserials_serial'
                                    });
                                });
                                container.append(el);
                            });
                        });
                };

                if(this.params){
                    this.load(this.params.url);
                }

                Lampa.Controller.add('content',{
                    toggle: ()=>{
                        Lampa.Controller.collectionSet(container.children(), el=>$(el));
                        Lampa.Controller.collectionFocus(container.children().first(), scroll.render());
                    }
                });

                Lampa.Controller.toggle('content');
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

        // =======================
        // Компонент серії / плеєр
        // =======================
        Lampa.Component.add('uaserials_serial', {
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                let container = $('<div class="list"></div>');
                scroll.append(container);

                this.load = (url)=>{
                    fetch(url)
                        .then(res=>res.text())
                        .then(html=>{
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(html, 'text/html');
                            let videoLink = doc.querySelector('iframe, video, .play-link'); // приклад
                            container.empty();
                            if(videoLink){
                                let el = $(`<div class="selector">Відтворити</div>`);
                                el.on('hover:enter', ()=>{
                                    Lampa.Player.play(videoLink.src || videoLink.href);
                                });
                                container.append(el);
                            }
                        });
                };

                if(this.params){
                    this.load(this.params.url);
                }

                Lampa.Controller.add('content',{
                    toggle: ()=>{
                        Lampa.Controller.collectionSet(container.children(), el=>$(el));
                        Lampa.Controller.collectionFocus(container.children().first(), scroll.render());
                    }
                });

                Lampa.Controller.toggle('content');
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

    }

    uaSerials();
})();