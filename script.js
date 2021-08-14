var evacuationTexts = {
    '-1': '(解除済み)',
    '0': '発表なし',
    '3': '高齢者等避難',
    '4': '避難指示',
    '5': '緊急安全確保'
}
var EVACUATION_DATA = null;
var home;
var jpnGroup = new L.featureGroup;
var map;
$.getJSON("https://iku55.000webhostapp.com/api/evacuation/list/" , function(data) {
    EVACUATION_DATA = data;
    // var
    //   ulObj = $("ul"),
    //   len = data.length;

    // for(var i = 0; i < len; i++) {
    //     console.log(data[i]);
    //     ulObj.append($("<li>").text(data[i].pref.name + ' ' + data[i].city.name + ': ' + data[i].level));
    // }
    home = () => {
        var lv3 = data.filter(d => d.level == 3).length;
        var lv4 = data.filter(d => d.level == 4).length;
        var lv5 = data.filter(d => d.level == 5).length;
        $('.detail').html('<p><span class="lv3">高齢者等避難</span>: '+lv3+'自治体<br><span class="lv4">避難指示</span>: '+lv4+'自治体<br><span class="lv5">緊急安全確保</span>: '+lv5+'自治体</p><p>［注意］<br>Yahoo! 天気・災害に掲載されていない自治体がある可能性があります。<br>また、地図は○○区の表示に非対応です。一覧から確認してください。</p><ul id="list"></ul>');
        var
            ulObj = $("ul#list"),
            len = EVACUATION_DATA.length;

        for(var i = 0; i < len; i++) {
            console.log(EVACUATION_DATA[i]);
            if (EVACUATION_DATA[i].level == 3 || EVACUATION_DATA[i].level == 4 || EVACUATION_DATA[i].level == 5) {
                ulObj.append($("<li>").html('<span class="lv' + EVACUATION_DATA[i].level + '">' + evacuationTexts[EVACUATION_DATA[i].level] + '</span> ' + EVACUATION_DATA[i].pref.name + ' ' + EVACUATION_DATA[i].city.name));
            }
        }
    }
    home();


    map = L.map('map-container');
    map.setView([36, 137], 7);
    map.attributionControl.addAttribution(
        "<a href='http://www.data.jma.go.jp/developer/gis.html' target='_blank'>地図データ：気象庁</a>"
    );
    map.attributionControl.addAttribution(
        "<a href='https://crisis.yahoo.co.jp/evacuation/' target='_blank'>データ：Yahoo! 天気・災害</a>"
    );

    
    //   let bglayer_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    //     subdomains: 'abcd',
    //     maxZoom: 19
    //   });
      
    //   bglayer_Positron.addTo(map);
      
      //extend Leaflet to create a GeoJSON layer from a TopoJSON file
      L.TopoJSON = L.GeoJSON.extend({
        addData: function (data) {
          var geojson, key;
          if (data.type === "Topology") {
            for (key in data.objects) {
              if (data.objects.hasOwnProperty(key)) {
                geojson = topojson.feature(data, data.objects[key]);
                L.GeoJSON.prototype.addData.call(this, geojson);
              }
            }
            return this;
          }
          L.GeoJSON.prototype.addData.call(this, data);
          return this;
        }
      });
      L.topoJson = function (data, options) {
        return new L.TopoJSON(data, options);
      };
      //create an empty geojson layer
      //with a style and a popup on click
      var geojson = L.topoJson(null, {
        style: function(feature){
            // console.log(data);
            // console.log(feature.properties.regioncode);
            // console.log((feature.properties.regioncode !== null) ? new String(feature.properties.regioncode).slice(0, -2) : null);
            // console.log(EVACUATION_DATA.filter(evacuation => evacuation.city.code == ((feature.properties.regioncode !== null) ? new String(feature.properties.regioncode).slice(0, -2) : null)));

            var evacuation = EVACUATION_DATA.filter(evacuation => evacuation.city.code == ((feature.properties.regioncode !== null) ? new String(feature.properties.regioncode).slice(0, -2) : null));
            evacuation = (evacuation !== null) ? evacuation[0] : null;
            // console.log(evacuation);
            // console.log((evacuation !== undefined)?evacuation['level']:undefined);
            if (evacuation == null || evacuation == undefined) {
                return {
                    color: "#555",
                    opacity: 1,
                    weight: 1,
                    fillColor: '#444',
                    fillOpacity: 0.8
                }
            } else if (evacuation.level == 3) {
                return {
                    color: "#555",
                    opacity: 1,
                    weight: 1,
                    fillColor: 'red',
                    fillOpacity: 0.8
                }
            } else if (evacuation.level == 4) {
                return {
                    color: "#555",
                    opacity: 1,
                    weight: 1,
                    fillColor: 'purple',
                    fillOpacity: 0.8
                }
            } else if (evacuation.level == 5) {
                return {
                    color: "purple",
                    opacity: 1,
                    weight: 2,
                    fillColor: 'black',
                    fillOpacity: 1
                }
            } else {
                return {
                    color: "#777",
                    opacity: 1,
                    weight: 1,
                    fillColor: '#444',
                    fillOpacity: 0.8
                }
            }
        },
        onEachFeature: function(feature, layer) {
            // var evacuation = EVACUATION_DATA.filter(evacuation => evacuation.city.code == ((feature.properties.regioncode !== null) ? new String(feature.properties.regioncode).slice(0, -2) : null));
            // evacuation = (evacuation !== undefined) ? evacuation[0] : undefined;
            // var evacuationLevel = (evacuation !== undefined) ? new String(evacuation.level) : '0';
            // // layer.bindPopup('<p>'+feature.properties.name+'</p><p>'+evacuationTexts[evacuationLevel]+'</p>');
            layer.on({
                click: (e) => {
                    var targetFeature = e.target.feature;
                    console.log(e.target.feature.properties.name);
                    var evacuation = EVACUATION_DATA.filter(evacuation => evacuation.city.code == ((targetFeature.properties.regioncode !== null) ? new String(targetFeature.properties.regioncode).slice(0, -2) : null));
                    evacuation = (evacuation !== undefined) ? evacuation[0] : undefined;
                    var evacuationLevel = (evacuation !== undefined) ? new String(evacuation.level) : '0';
                    if (evacuationLevel == 0) {
                        $('.detail').html('<p class="back" onclick="home();">戻る</p><h1>'+targetFeature.properties.name+'</h1><p class="hurigana">'+targetFeature.properties.namekana.replaceAll("ほくぶ", "").replaceAll("なんぶ", "").replaceAll("せいぶ", "").replaceAll("とうぶ", "")+'</p><h3>避難情報</h3><p>'+evacuationTexts[evacuationLevel]+'</p>');
                    } else {
                        $('.detail').html('<p class="back" onclick="home();">戻る</p><h1>'+evacuation.pref.name+' '+evacuation.city.name+'</h1><p class="hurigana">'+targetFeature.properties.namekana.replaceAll("ほくぶ", "").replaceAll("なんぶ", "").replaceAll("せいぶ", "").replaceAll("とうぶ", "")+'</p><p><div class="table"></div><br><a href="'+evacuation.link+'" target="_blank">Yahoo! 天気・災害で詳細を見る</a><br><a href="https://iku55.000webhostapp.com/api/evacuation/get/'+evacuation.pref.code+'/'+evacuation.city.code+'/" download>JSONをダウンロード</a></p>');
                        $.getJSON("https://iku55.000webhostapp.com/api/evacuation/get/"+evacuation.pref.code+'/'+evacuation.city.code+'/' , function(evdata) {
                            console.log(evdata);
                            $('div.table').html('<h3>避難情報</h3>'+'<p style="display: grid; grid-template-columns: 120px calc(100% - 120px);"><span class="lv'+evacuationLevel+'" style="height: 1.5em; text-align: center;">警戒レベル'+evacuationLevel+'</span>'+evdata.reason+'</p><p>計 '+evdata.total.households+'世帯 '+evdata.total.people+'人</p>'+'<div class="evlist"></div>'+'<p>'+evdata.supplement+'</p>');
                            var lv3Zones = evdata.zones.filter(zone => zone.level == 3);
                            var lv4Zones = evdata.zones.filter(zone => zone.level == 4);
                            var lv5Zones = evdata.zones.filter(zone => zone.level == 5);
                            if (lv5Zones.length > 0) {
                                $('.evlist').append($('<p class="lv5">').text('緊急安全確保'));
                                $('.evlist').append($('<table>').append($('<tbody class="lv5tbl">')));
                                for (var i = 0; i < lv5Zones.length; i++) {
                                    $('.lv5tbl').append($('<tr>').html('<td style="width: 50%;">'+lv5Zones[i].zone+'</td><td style="width: 25%;">'+lv5Zones[i].households+((lv5Zones[i].households == "---")?'':'世帯')+'</td><td style="width: 25%;">'+lv5Zones[i].people+((lv5Zones[i].people == "---")?'':'人')+'</td>'));
                                }
                            }
                            if (lv4Zones.length > 0) {
                                $('.evlist').append($('<p class="lv4">').text('避難指示'));
                                $('.evlist').append($('<table>').append($('<tbody class="lv5tbl">')));
                                for (var i = 0; i < lv4Zones.length; i++) {
                                    $('.lv5tbl').append($('<tr>').html('<td style="width: 50%;">'+lv4Zones[i].zone+'</td><td style="width: 25%;">'+lv4Zones[i].households+((lv4Zones[i].households == "---")?'':'世帯')+'</td><td style="width: 25%;">'+lv4Zones[i].people+((lv4Zones[i].people == "---")?'':'人')+'</td>'));
                                }
                            }
                            if (lv3Zones.length > 0) {
                                $('.evlist').append($('<p class="lv3">').text('高齢者等避難'));
                                $('.evlist').append($('<table>').append($('<tbody class="lv5tbl">')));
                                for (var i = 0; i < lv3Zones.length; i++) {
                                    $('.lv5tbl').append($('<tr>').html('<td style="width: 50%;">'+lv3Zones[i].zone+'</td><td style="width: 25%;">'+lv3Zones[i].households+((lv3Zones[i].households == "---")?'':'世帯')+'</td><td style="width: 25%;">'+lv3Zones[i].people+((lv3Zones[i].people == "---")?'':'人')+'</td>'));
                                }
                            }
                            // for (var i = 0; i < evdata.zones.length; i++) {
                            //     $('.evlist').append($('<li>').html(evdata.zones[i].zone+':'+'<span class="lv'+evdata.zones[i].level+'">'+evacuationTexts[evdata.zones[i].level]+'</span>'));
                            // }
                            // $('.evlist')
                        });
                    }
                    console.log(targetFeature);
                    map.setView(layer.getBounds().getCenter(), 8);
                }
            })
            // $('.detail').html('<h1>'+feature.properties.name+'</h1><p>'+evacuationTexts[evacuationLevel]+'</p>')
        }
      })
      .addTo(map);

      var japan2json = L.topoJson(null, {
        style: {
            color: "#666",
            opacity: 1,
            weight: 2,
            fillColor: 'transparent',
            fillOpacity: 0
        },
        onEachFeature: (feature, layer) => {
          jpnGroup.addLayer(layer);
          console.log(jpnGroup);
      }})
      .addTo(map);

      //fill: #317581;
      //define a function to get and parse geojson from URL
      async function getGeoData(url) {
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data)
        return data;
      }
      
      //fetch the geojson and add it to our geojson layer
      getGeoData('japan.topojson').then(data => geojson.addData(data));
      getGeoData('jp2.topojson').then(data => japan2json.addData(data));

    //   $('.leaflet-control-zoom.leaflet-bar.leaflet-control').append($('<a class="leaflet-control-home">').on('click',(e) => {
    //     map.fitBounds(jpnGroup.getBounds());
    //   }));
});
