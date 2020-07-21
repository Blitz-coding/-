"use strict";

function initMap() {
  // マップの初期化
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 36.38992, lng: 139.06065 }
  });

  // クリックイベントを追加
  map.addListener("click", function(e) {
    getClickLatLng(e.latLng, map);
  });
}

function getClickLatLng(lat_lng, map) {
  // 座標を表示
  document.getElementById("lat").textContent = lat_lng.lat();
  document.getElementById("lng").textContent = lat_lng.lng();

  lat = lat_lng.lat();
  long = lat_lng.lng();

  // マーカーを設置
  var marker = new google.maps.Marker({
    position: lat_lng,
    map: map
  });

  // 座標の中心をずらす
  // http://syncer.jp/google-maps-javascript-api-matome/map/method/panTo/
  map.panTo(lat_lng);

  // 天気予報　API Request call
  ajaxRequest(lat, long);
}

var lat = 0.0;
var long = 0.0;

// geolocation
function success(pos) {
  ajaxRequest(pos.coords.latitude, pos.coords.longitude);
}

function fail(error) {
  alert("位置情報の取得に失敗しました。エラーコード：" + error.code);
}

navigator.geolocation.getCurrentPosition(success, fail);

//UTCをミリ秒に
function utcToJSTime(utcTime) {
  return utcTime * 1000;
}

// データ取得
function ajaxRequest(lat, long) {
  const url = "https://api.openweathermap.org/data/2.5/forecast";
  const appId = "api";

  $.ajax({
    url: url,
    data: {
      appid: appId,
      lat: lat,
      lon: long,
      units: "metric",
      lang: "ja"
    }
  })
    .done(function(data) {
      console.log(data);

      //都市名、国名
      // console.log("都市名:" + data.city.name);
      // console.log("国名:" + data.city.country);

      $("#place").text(data.city.name + "." + data.city.country);

      //天気予報データ
      data.list.forEach(function(forecast, index) {
        //日時を取得
        const dateTime = new Date(utcToJSTime(forecast.dt));
        //月を取得
        const month = dateTime.getMonth() + 1;
        //日を取得
        const date = dateTime.getDate();
        // 時間を取得
        const hours = dateTime.getHours();
        // 分を取得
        const min = String(dateTime.getMinutes()).padStart(2, "0");
        //気温　Math.roundは小数点を四捨五入
        const temperature = Math.round(forecast.main.temp);
        //天気の説明
        const description = forecast.weather[0].description;
        //アイコン
        const iconPath = `images/${forecast.weather[0].icon}.svg`;

        //現在の日時とそれ以外で出力を変える
        if (index === 0) {
          const currentWeather = `
          <div class = "icon"><img src = "${iconPath}"></div>
          <div class = "info">
            <p>
              <span class = "description">現在の天気:${description}</span>
              <span class = "temp">${temperature}</span>℃
            </p>
          </div>`;
          $("#weather").html(currentWeather);
        } else {
          const tableRow = `
          <tr>
            <td class = "info">
              ${month}/${date} ${hours}:${min}
            </td>
            <td class = "icon"><img src = "${iconPath}"></td>
            <td> <span class = "description">${description}</span></td>
            <td> <span class = "temp">${temperature}℃</span></td>
          </tr>`;
          $("#forecast").append(tableRow);
        }

        // console.log("日時:" + `${month}/${date} ${hours}:${min}`);
        // console.log("気温:" + temperature);
        // console.log("天気:" + description);
        // console.log("画像パス:" + iconPath);
      });
    })
    .fail(function() {
      console.log("$.ajax failed!");
    });
}
