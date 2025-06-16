from django.contrib.gis import admin
from sss import models


@admin.register(models.District)
class DistrictAdmin(admin.ModelAdmin):
    raw_id_fields = ('region',)

@admin.register(models.UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'region', 'district', 'created')
    raw_id_fields = ('user', 'region', 'district')
    readonly_fields = ['created',]

@admin.register(models.ProxyCache)
class ProxyCacheAdmin(admin.ModelAdmin):
    list_display = ('id', 'layer_name', 'created', 'cache_expiry', 'active')
    readonly_fields = ['created',]

@admin.register(models.BomSyncList)
class BomSyncListAdmin(admin.ModelAdmin):
    list_display = ('id', 'file_name', 'created', 'active')
    readonly_fields = ['created',]

class CatalogueTagInline(admin.TabularInline):
    model = models.CatalogueTag
    extra = 0

@admin.register(models.Catalogue)
class Catalogue(admin.ModelAdmin):
    list_display = ('id', 'identifier', 'type', 'updated', 'created', 'active')
    readonly_fields = ['updated', 'created',]  
    inlines = [CatalogueTagInline,]  
    
@admin.register(models.MapServer)
class MapServer(admin.ModelAdmin):
    list_display = ('id', 'name', 'url', 'created')
    readonly_fields = ['updated', 'created',]  
    
@admin.register(models.CatalogueSyncCSW)
class MapServer(admin.ModelAdmin):
    list_display = ('id', 'identifier', 'active', 'removed_from_csw', 'updated', 'created')
    search_fields = ('id', 'identifier',)
    readonly_fields = ['updated', 'created','json_data','identifier','csw_id']

admin.site.register(models.Region)

@admin.register(models.Proxy)
class ProxyAdmin(admin.ModelAdmin):
    list_display = ("request_path", "username", "basic_auth_enabled", "active")
    search_fields = ("request_path",)
    ordering = ("request_path",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "request_path",
                    "proxy_url",
                    "basic_auth_enabled",
                    "username",
                    "password",
                    "active",
                )
            },
        ),
    )

@admin.register(models.SpatialDataCalculation)
class SpatialDataCalculationAdmin(admin.ModelAdmin):
    list_display = ('id', 'bfrs', 'calculation_status', 'created', 'user')
    readonly_fields = ['updated', 'created', 'output', 'user', 'logs']
    
@admin.register(models.CRSSettings)
class CRSSettingsAdmin(admin.ModelAdmin):
    list_display = ('id','crs')