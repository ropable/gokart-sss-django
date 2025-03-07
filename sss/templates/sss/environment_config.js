var env = {
    // authUrl:'/sso/profile',
    authUrl: "{{ settings.ACCOUNT_DETAILS_URL }}",
    appType: (window.location.protocol == "file:")?"cordova":"webapp",
    // cswService:"https://csw-uat.dbca.wa.gov.au/catalogue/api2/application/records",
    cswService: "{{ settings.CSW_SERVICE_URL }}",
    catalogueAdminService:"{{ settings.CATALOGUE_URL }}",

    //kmiService:"https://kmi.dbca.wa.gov.au/geoserver",
    kmiService:"{{ mapserver.kmi }}",
    kmiApiService: "{{ settings.KMI_API_URL }}",
    legendSrc:"{{ mapserver.kmi }}/gwc/service/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&legend_options=fontName:Times%20New%20Roman;fontAntiAliasing:true;fontSize:14;bgColor:0xFFFFEE;dpi:120;labelMargin:10&LAYER=",

	hotspotService:"{{ settings.HOTSPOT_SERVICE_URL }}",

    gokartService:"{{ settings.SSS_SERVICE_URL }}",
    resourceTrackingService:"{{ settings.RESOURCE_TRACKING_SERVICE_URL }}",
    bfrsService:"{{ settings.BFRS_SERVICE_URL }}",
    staticService:"{{ settings.DBCA_STATIC_URL }}",

    s3Service:"{{ settings.SSS_FILE_URL }}",
    weatherForecastUrl:"{{ settings.WEATHERFORECAST_URL }}",
    weatherForecastUser:"{{ settings.WEATHERFORECAST_USER }}",
    weatherForecastPassword:"{{ settings.WEATHERFORECAST_PASSWORD }}",

    appMapping:{
    },
    layerMapping:{
        "dpaw:bushfirelist_latest"                  : "{{ settings.BUSHFIRELIST_LATEST_LAYER }}",
        "dpaw:bushfire_latest"                      : "{{ settings.BUSHFIRE_LATEST_LAYER }}",
        "dpaw:bushfire_final_fireboundary_latest"   : "{{ settings.BUSHFIRE_FINAL_FIREBOUNDARY_LATEST_LAYER }}",
        "dpaw:bushfire_fireboundary_latest"         : "{{ settings.BUSHFIRE_FIREBOUNDARY_LATEST_LAYER }}",
        "dpaw:bushfire"                             : "{{ settings.BUSHFIRE_LAYER }}",
        "dpaw:bushfire_fireboundary"                : "{{ settings.BUSHFIRE_FIREBOUNDARY_LAYER }}",
        "dpaw:resource_tracking_live"               : "{{ settings.RESOURCE_TRACKING_LIVE_LAYER }}",
        //"dpaw:resource_tracking_history"            : "dpaw:resource_tracking_history_uat"

    },
    overviewLayer:"{{ settings.OVERVIEW_LAYER }}",
    hotspotsUrl:"{{mapserver.hotspots}}"
};

