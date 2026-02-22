document.addEventListener('DOMContentLoaded', function() {  
      // Add climbed badge as a Leaflet control
      var climbedBadgeControl;
      function addClimbedBadge(count) {
        if(climbedBadgeControl) map.removeControl(climbedBadgeControl);
        var CountBadge = L.Control.extend({
          options: { position: 'topright' },
          onAdd: function () {
            var div = L.DomUtil.create('div', 'climbed-count-badge');
            var total = allData.length - 1;
            div.innerHTML = '<span class="count">' + count + ' / ' + total + '</span>' +
              '<span class="label">peaks climbed</span>';
            L.DomEvent.disableClickPropagation(div);
            return div;
          }
        });
        climbedBadgeControl = new CountBadge();
        climbedBadgeControl.addTo(map);
      }
    // Helper to update climbed counter badge
    function updateClimbedCounter(data) {
      var climbed = data.filter(function(p){ return p.Climbed && p.Climbed.toLowerCase() === 'yes'; });
      addClimbedBadge(climbed.length);
    }
  if (!window.L) {
    alert('Leaflet library failed to load');
    console.warn('Leaflet not loaded');
    return;
  }
  // initialize map with fractional zoom support – will recenter when data loads
  var map = L.map('map', { zoomSnap: 0.5, zoomDelta: 0.25 });
  // use a simpler, light-styled basemap with minimal administrative borders
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 13,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);
  map.invalidateSize();

  // load peaks data and add markers
  var allData = [];
  var markers = [];

  // simple mapping of country names to ISO codes used for emoji flags
  var countryCodes = {
    'France':'FR','Italy':'IT','Switzerland':'CH','Austria':'AT','Spain':'ES','Germany':'DE',
    'Andorra':'AD','Bulgaria':'BG','Greece':'GR','Slovenia':'SI','Albania':'AL','Macedonia':'MK','North Macedonia':'MK',
    'Bosnia and Herzegovina':'BA','The Netherlands':'NL','Kazakhstan':'KZ','San Marino':'SM','Monaco':'MC','Vatican':'VA',
    'Kosovo':'XK','Slovakia':'SK','Liechtenstein':'LI','Romania':'RO','Montenegro':'ME',
    'Poland':'PL','Czech Republic':'CZ','Serbia':'RS','Croatia':'HR','Belgium':'BE','Netherlands':'NL',
    'Luxembourg':'LU','Denmark':'DK','Sweden':'SE','Norway':'NO','Finland':'FI','Estonia':'EE',
    'Latvia':'LV','Lithuania':'LT','Ukraine':'UA','Belarus':'BY','Moldova':'MD','Hungary':'HU',
    'Ireland':'IE','United Kingdom':'GB','Portugal':'PT','Turkey':'TR','Russia':'RU','Iceland':'IS','Malta':'MT'
  };
  // normalization helper for matching CSV country names
  function normalizeName(n){
    if(!n) return '';
    return n.toString().toLowerCase().trim()
      .replace(/^the\s+/, '')
      .replace(/\s*&\s*/g, ' and ')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  var countryCodesNormalized = {};
  Object.keys(countryCodes).forEach(function(k){ countryCodesNormalized[normalizeName(k)] = countryCodes[k]; });
  // common alternates
  var extras = {
    'czechia':'CZ',
    'macedonia':'MK',
    'north macedonia':'MK',
    'uk':'GB',
    'vatican city':'VA',
    'the netherlands':'NL',
    'bosnia hercegovina':'BA',
    'bosnia and hercegovina':'BA',
    'bosnia & hercegovina':'BA'
  };
  Object.keys(extras).forEach(function(k){ countryCodesNormalized[normalizeName(k)] = extras[k]; });

  function lookupISO(name){
    if(!name) return '';
    var k = name.trim();
    if(countryCodes[k]) return countryCodes[k];
    var nk = normalizeName(k);
    return countryCodesNormalized[nk] || '';
  }

  function countryToFlag(country){
    // treat 'bosnia & hercegovina' and variants as a single country
    var norm = normalizeName(country);
    if(norm === 'bosnia hercegovina' || norm === 'bosnia and hercegovina' || norm === 'bosnia & hercegovina') {
      var iso = lookupISO('Bosnia and Herzegovina');
      if(iso && iso.length===2){
        var code = iso.toLowerCase();
        return '<img src="https://flagcdn.com/24x18/' + code + '.png" alt="' + iso + '" class="flag-img">';
      }
      return '';
    }
    // If country contains 'and' or '&' but is not a known shared peak, treat as single country
    if(norm === 'bosnia hercegovina' || norm === 'bosnia and hercegovina' || norm === 'bosnia & hercegovina') {
      var iso = lookupISO('Bosnia and Herzegovina');
      if(iso && iso.length===2){
        var code = iso.toLowerCase();
        return '<img src="https://flagcdn.com/24x18/' + code + '.png" alt="' + iso + '" class="flag-img">';
      }
      return '';
    }
    // Otherwise, split only for known shared peaks
    var parts = [country];
    if(country === 'Albania & Macedonia' || country === 'Albania and Macedonia') {
      parts = country.split(/\s*(?:&|\band\b)\s*/i).filter(Boolean);
    }
    var flags = parts.map(function(part){
      var iso = lookupISO(part.trim());
      if(iso && iso.length===2){
        var code = iso.toLowerCase();
        return '<img src="https://flagcdn.com/24x18/' + code + '.png" alt="' + iso + '" class="flag-img">';
      }
      console.warn('No ISO for', part);
      return '';
    }).filter(Boolean);
    return flags.join(' ');
  }

  function render(data) {
    markers.forEach(function(m){ map.removeLayer(m); });
    markers = [];
    // List of known shared peaks (from CSV)
    var sharedPeaks = [
      'Albania & Macedonia',
      'Albania and Macedonia',
      'France & Italy',
      'France and Italy'
    ];
    data.forEach(function(p){
      if (!p.Country) return;
      var lat = parseFloat(p.lat), lon = parseFloat(p.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        var climbed = p.Climbed && p.Climbed.toLowerCase()==='yes';
        var color = climbed ? 'green' : 'red';
        var marker = L.circleMarker([lat, lon], {radius:8, color: color, fillColor: color, fillOpacity:0.6}).addTo(map);
        var tipHtml = '';
        // Only split if country is a known shared peak
        if (sharedPeaks.includes(p.Country.trim())) {
          var countryParts = p.Country.split(/\s*(?:&|\band\b)\s*/i).map(function(part){ return part.trim(); });
          var flag1 = countryToFlag(countryParts[0]);
          var flag2 = countryToFlag(countryParts[1]);
          tipHtml = '<span class="tip-country">' + (flag1 ? '<span class="flag">' + flag1 + '</span> ' : '') + countryParts[0] + '</span>' +
                    '<span class="tip-country">' + (flag2 ? '<span class="flag">' + flag2 + '</span> ' : '') + countryParts[1] + '</span>';
        } else {
          // Single country: one line
          var flag = countryToFlag(p.Country);
          tipHtml = '<span class="tip-country">' + (flag ? '<span class="flag">' + flag + '</span> ' : '') + p.Country + '</span>';
        }
        // Format elevation: remove spaces, add thousands separator
        var elev = '';
        if (p.Elevation) {
          var raw = p.Elevation.replace(/[^\d.]/g, '');
          elev = parseInt(raw, 10).toLocaleString('en-US');
        }
        tipHtml += '<span class="tip-peak"><strong>' + p.Peak + '</strong> (' + elev + ' m)</span>';
        marker.bindTooltip(tipHtml, {
          permanent: false,
          direction: 'auto',
          offset: [0, -10],
          className: 'peak-tooltip',
          sticky: true,
          maxWidth: 800
        });
        marker.on('mouseover', function(e){ this.openTooltip(); });
        marker.on('mouseout', function(e){ this.closeTooltip(); });
        markers.push(marker);
      }
    });
    if (markers.length) {
      var group = L.featureGroup(markers);
      var bounds = group.getBounds();
      // fit tightly to markers, minimal padding
      map.fitBounds(bounds, {padding: [10, 10]});
      // determine what zoom level fitBounds just used (or would use)
        // apply extra zoom after fitBounds finishes so we base on the actual fit result
        var extra = 3; // bump this to make default view closer; supports fractional values
        map.once('moveend', function(){
          var current = map.getZoom();
          var target = current + extra;
          if (target > map.options.maxZoom) target = map.options.maxZoom;
          // set the new zoom (fractional values honored when zoomSnap/zoomDelta are set)
          map.setZoom(target);
        });
    }
  }

  // ensure tooltip container width always fits its content when opened
  map.on('tooltipopen', function(e){
    // run on next tick so Leaflet has finished inserting and styling the tooltip
    setTimeout(function(){
      try{
        var tip = e.tooltip && e.tooltip._container;
        if(!tip) return;
        var countryLine = tip.querySelector('.tip-country');
        var peakLine = tip.querySelector('.tip-peak');
        // temporarily measure both lines as inline-block nowrap
        if(countryLine) {
          countryLine.style.whiteSpace = 'nowrap';
          countryLine.style.display = 'inline-block';
        }
        if(peakLine) {
          peakLine.style.whiteSpace = 'nowrap';
          peakLine.style.display = 'inline-block';
        }
        var w1 = countryLine ? (countryLine.scrollWidth || countryLine.offsetWidth || 0) : 0;
        var w2 = peakLine ? (peakLine.scrollWidth || peakLine.offsetWidth || 0) : 0;
        var needed = Math.max(w1, w2);
        var pad = 24;
        var final = needed + pad;
        tip.style.width = final + 'px';
        tip.style.minWidth = final + 'px';
        tip.style.maxWidth = 'none';
        tip.style.overflow = 'visible';
        tip.style.boxSizing = 'border-box';
        // restore layout: both lines always single line, block
        if(countryLine) {
          countryLine.style.whiteSpace = 'nowrap';
          countryLine.style.display = 'block';
        }
        if(peakLine) {
          peakLine.style.whiteSpace = 'nowrap';
          peakLine.style.display = 'block';
        }
        // try to reflow tooltip layout/positioning if internal methods exist
        if(e.tooltip._updateLayout) e.tooltip._updateLayout();
        if(e.tooltip._updatePosition) e.tooltip._updatePosition();
      }catch(err){
        console.warn('tooltip sizing failed', err);
      }
    }, 0);
  });

  Papa.parse('/data/eur_peaks.csv', {
    download: true,
    header: true,
    delimiter: ';',
    complete: function(results){
      allData = results.data;
      console.log('parsed rows', allData.length);
      // build lookup by country
      var status = {};
      allData.forEach(function(p){
        if(p.Country) status[p.Country.trim()] = (p.Climbed && p.Climbed.toLowerCase()==='yes');
      });
      render(allData);
      updateClimbedCounter(allData);
      // Populate table below map with all peaks
      var tbody = document.getElementById('peaks-body');
      if (tbody) {
        tbody.innerHTML = '';
        var idx = 1;
        allData.forEach(function(p) {
          if (!p.Country || !p.Peak) return;
          var elev = '';
          if (p.Elevation) {
            // Remove all spaces and non-digit characters except dot
            var raw = p.Elevation.replace(/\s+/g, '').replace(/[^\d.]/g, '');
            elev = parseInt(raw, 10).toLocaleString('en-US');
          }
          var climbed = p.Climbed && p.Climbed.toLowerCase() === 'yes';
          // Prepend flag(s) before country name, handle shared peaks
          var countryCell = '';
          var sharedPeaks = ['France & Italy', 'France and Italy', 'Albania & Macedonia', 'Albania and Macedonia'];
          if (sharedPeaks.includes(p.Country.trim())) {
            var countryParts = p.Country.split(/\s*(?:&|and)\s*/i).map(function(part){ return part.trim(); });
            var flag1 = countryToFlag(countryParts[0]);
            var flag2 = countryToFlag(countryParts[1]);
            countryCell = (flag1 ? flag1 + ' ' : '') + countryParts[0] + '<br>' + (flag2 ? flag2 + ' ' : '') + countryParts[1];
          } else {
            var flagHtml = countryToFlag(p.Country);
            countryCell = (flagHtml ? flagHtml + ' ' : '') + p.Country;
          }
          var row = document.createElement('tr');
          row.innerHTML = '<td>' + idx + '</td>' +
                          '<td>' + countryCell + '</td>' +
                          '<td>' + p.Peak + '</td>' +
                          '<td>' + elev + '</td>';
          row.style.backgroundColor = climbed ? 'rgba(74, 222, 128, 0.18)' : 'rgba(255, 99, 99, 0.18)';
          tbody.appendChild(row);
          idx++;
        });
      }
    }
  });
});
