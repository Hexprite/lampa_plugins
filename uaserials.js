(function(){
    'use strict';

    function uaSerials(){
        // Додаємо пункт у головне меню Lampa
        Lampa.Listener.follow('app', function(e){
            if(e.type === 'ready'){
                Lampa.Menu.add({
                    name: 'UASerials',
                    icon: 'fas fa-film',
                    component: 'uaserials_menu'
                });
            }
        });

        // Головне меню плагіна
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
            render: function(){
                if(!this._render) this._render = $('<div class="activity"></div>');
                return this._render;
            }
        });

        // Список серіалів
        Lampa.Component.add('uaserials_list',{
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                let page = this.activity.page || 1;
                let url = this.activity.url.replace(/page\/\d+\//,'page/'+page+'/');

                fetch(url).then(r=>r.text()).then(html=>{
                    let regex = /<a href="([^"]+)" class="movie-block">[\s\S]*?<img src="([^"]+)" alt="([^"]+)"/g;
                    let match; let cards=[];

                    while((match=regex.exec(html))!==null){
                        let link = 'https://uaserials.com'+match[1];
                        let poster = match[2];
                        let title = match[3];

                        let card = Lampa.Template.get('card',{title,poster,url:link});
                        card.on('hover:enter',()=>{
                            Lampa.Activity.push({title,url:link,poster,component:'uaserials_details'});
                        });
                        scroll.append(card);
                        cards.push(card);
                    }

                    let nextBtn = $('<div class="selector">Наступна сторінка →</div>');
                    nextBtn.on('hover:enter',()=>{
                        Lampa.Activity.push({title:this.activity.title,url:this.activity.url,component:'uaserials_list',page:page+1,search:this.activity.search});
                    });
                    scroll.append(nextBtn); cards.push(nextBtn);

                    Lampa.Controller.add('content',{
                        toggle: ()=>{
                            Lampa.Controller.collectionSet(cards, card=>$(card));
                            Lampa.Controller.collectionFocus(cards[0], scroll.render());
                        }
                    });
                    Lampa.Controller.toggle('content');
                });
            },
            render: function(){
                if(!this._render) this._render = $('<div class="activity"></div>');
                return this._render;
            }
        });

        // Деталі серіалу
        Lampa.Component.add('uaserials_details',{
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                fetch(this.activity.url).then(r=>r.text()).then(html=>{
                    let poster = this.activity.poster || (html.match(/<img class="poster" src="([^"]+)"/)||[])[1];
                    let descr = (html.match(/<div class="full-text">([\s\S]*?)<\/div>/)||[])[1];
                    descr = descr ? descr.replace(/<[^>]+>/g,'').trim() : 'Без опису';
                    let info = (html.match(/<ul class="movie-meta">([\s\S]*?)<\/ul>/)||[])[1];
                    info = info ? info.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim() : '';

                    let block = $(`
                        <div class="full-descr">
                            <div class="full-poster"><img src="${poster}" /></div>
                            <div class="full-title"><h2>${this.activity.title}</h2></div>
                            <div class="full-info">${info}</div>
                            <div class="full-text">${descr}</div>
                        </div>
                    `);

                    scroll.append(block);

                    let btn = $('<div class="selector">📺 Вибрати сезон</div>');
                    btn.on('hover:enter',()=>{
                        Lampa.Activity.push({title:this.activity.title,url:this.activity.url,component:'uaserials_seasons'});
                    });
                    scroll.append(btn);

                    Lampa.Controller.add('content',{
                        toggle: ()=>{
                            Lampa.Controller.collectionSet([btn], el=>$(el));
                            Lampa.Controller.collectionFocus(btn, scroll.render());
                        }
                    });

                    Lampa.Controller.toggle('content');
                });
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

        // Сезони серіалу
        Lampa.Component.add('uaserials_seasons',{
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                fetch(this.activity.url).then(r=>r.text()).then(html=>{
                    let seasonBlocks = html.split('<div class="series-list">').slice(1);
                    let cards=[];

                    seasonBlocks.forEach((block,i)=>{
                        let seasonNum = (block.match(/Сезон\s*(\d+)/)||[])[0] || ('Сезон '+(i+1));
                        let btn = $(`<div class="selector">${seasonNum}</div>`);
                        btn.on('hover:enter',()=>{
                            Lampa.Activity.push({
                                title: this.activity.title+' – '+seasonNum,
                                url: this.activity.url,
                                seasonIndex:i,
                                component:'uaserials_serial'
                            });
                        });
                        scroll.append(btn); cards.push(btn);
                    });

                    Lampa.Controller.add('content',{
                        toggle: ()=>{
                            Lampa.Controller.collectionSet(cards, el=>$(el));
                            Lampa.Controller.collectionFocus(cards[0], scroll.render());
                        }
                    });
                    Lampa.Controller.toggle('content');
                });
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });

        // Серії сезону
        Lampa.Component.add('uaserials_serial',{
            onCreate: function(){
                let scroll = new Lampa.Scroll({mask:true});
                this.render().append(scroll.render());

                fetch(this.activity.url).then(r=>r.text()).then(html=>{
                    let seasonBlocks = html.split('<div class="series-list">').slice(1);
                    let block = seasonBlocks[this.activity.seasonIndex||0];

                    let regex = /<a href="([^"]+)" class="series-btn">([^<]+)<\/a>/g;
                    let match; let cards=[]; let episodes=[];

                    while((match=regex.exec(block))!==null){
                        let link='https://uaserials.com'+match[1];
                        let title=match[2].trim();

                        let card = Lampa.Template.get('card',{title,poster:'',url:link});
                        card.on('hover:enter',()=>{
                            this.playEpisode(episodes,link,title);
                        });
                        scroll.append(card); cards.push(card);
                        episodes.push({title,link});
                    }

                    Lampa.Controller.add('content',{
                        toggle: ()=>{
                            Lampa.Controller.collectionSet(cards, card=>$(card));
                            Lampa.Controller.collectionFocus(cards[0], scroll.render());
                        }
                    });
                    Lampa.Controller.toggle('content');
                });
            },
            playEpisode: function(episodes,startLink,startTitle){
                let playlist=[];
                let loadEpisode = (ep,callback)=>{
                    fetch(ep.link).then(r=>r.text()).then(html=>{
                        let match = html.match(/<iframe[^>]+src="([^"]+)"/);
                        if(match) playlist.push({title:ep.title,url:match[1]});
                        callback();
                    }).catch(()=>callback());
                };
                let i=0;
                let next=()=>{
                    if(i<episodes.length){
                        loadEpisode(episodes[i],()=>{i++;next();});
                    } else {
                        let startIndex = playlist.findIndex(p=>p.title===startTitle);
                        if(startIndex===-1) startIndex=0;
                        Lampa.Player.play(playlist[startIndex]);
                        Lampa.Player.playlist(playlist);
                    }
                }; next();
            },
            render: function(){if(!this._render)this._render=$('<div class="activity"></div>'); return this._render;}
        });
    }

    uaSerials();
})();