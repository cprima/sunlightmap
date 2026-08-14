## How to use these tests

In the weeks before the release of QGIS 3 I started to look into PyQGIS and automated my (basic) needs to create a world map from naturalearth data. The focus shifted quickly towards porting these crudes scripts to the upcoming new relase which was to break backward compatibility. By writing my first Python unittests in this folder there is also evolving a collection of PyQGIS scripts that will work standalone a.k.a. copy&paste.

- Install QGIS2.99 nightly

- clone this folder (or the full repo), cd into this directory

- run ./setup.sh which creates folders relative to this directory (did I mention to cd into it first?)

- run `export QT_LOGGING_RULES="*.debug=false" && python3 -m unittest discover -v`

The environment variable QT_LOGGING_RULES (see http://doc.qt.io/qt-5/qloggingcategory.html) reduces most of the debug output which I found easier to read when working with the unittest runs.

```bash
...........F..............
======================================================================
FAIL: test_qgissettingsdirpath (test_qgisapplicationdefault.TestQgisApplicationDefault)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/user/hosthome/ionic/sunlightmap_app/application/physical/GIS/qgis3-tests/test_qgisapplicationdefault.py", line 53, in test_qgissettingsdirpath
    os.path.expanduser('~/.local/share/QGIS/QGIS3/profiles/default'))  # todo check bug
AssertionError: '/home/user/.local/share/profiles/default/' != '/home/user/.local/share/QGIS/QGIS3/profiles/default'
- /home/user/.local/share/profiles/default/
?                                         -
+ /home/user/.local/share/QGIS/QGIS3/profiles/default
?                         +++++++++++


----------------------------------------------------------------------
Ran 26 tests in 0.234s

FAILED (failures=1)

```

## How to use the tests for own PyQGIS scripts

In each `test_qgis[a-z]*py"` file take the module import, the code in setUp() and the testcase. This should work with `qgis --code yourfile.py`.

## Ways to work with the debug output in nightly builds

To demonstrate various ways to deal with the debug output this Python code will be used:

`sample.py`
```Python
import os
from qgis.core import *

os.environ["QT_QPA_PLATFORM"] = "offscreen"

QgsApplication.setPrefixPath("/usr", False)
qgs = QgsApplication([], False)
qgs.initQgis()

print(qgs.qgisSettingsDirPath())

qgs.exitQgis()
```

The default output on e.g. Ubuntun 16.04 makes it hard to differentiate between the wanted result and debugging information:

<pre>
user@qgisnightly:~$ python3 sample.py
../../src/core/qgsproviderregistry.cpp: 101: (init) [0ms] Checking /usr/lib/qgis/plugins for provider plugins
../../src/core/qgsproviderregistry.cpp: 154: (init) [12ms] Checking /usr/lib/qgis/plugins/libbasicauthmethod.so: ...invalid (no isProvider method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [2ms] Checking /usr/lib/qgis/plugins/libcoordinatecaptureplugin.so: ...invalid (has type method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [6ms] Checking /usr/lib/qgis/plugins/libevis.so: ...invalid (has type method)
../../src/providers/gdal/qgsgdalprovider.cpp: 2206: (buildSupportedRasterFileFilterAndExtensions) [4ms] GDAL driver count: 210
../../src/providers/gdal/qgsgdalprovider.cpp: 2340: (buildSupportedRasterFileFilterAndExtensions) [1ms] Raster filter list built: All files (*);;GDAL/OGR VSIFileHandler (*.zip *.gz *.tar *.tar.gz *.tgz *.ZIP *.GZ *.TAR *.TAR.GZ *.TGZ);;ACE2 (*.ace2 *.ACE2);;ARC Digitized Raster Graphics (*.gen *.GEN);;ASCII Gridded XYZ (*.xyz *.XYZ);;Arc/Info ASCII Grid (*.asc *.ASC);;Arc/Info Binary Grid (hdr.adf HDR.ADF);;Arc/Info Export E00 GRID (*.e00 *.E00);;AutoCAD Driver (*.dwg *.DWG);;CALS  (*..cal *..ct1 *..CAL *..CT1);;DRDC COASP SAR Processor Raster (*.hdr *.HDR);;DTED Elevation Raster (*.dt0 *.dt1 *.dt2 *.DT0 *.DT1 *.DT2);;ECRG TOC format (*.xml *.XML);;ESRI .hdr Labelled (*.bil *.BIL);;EUMETSAT Archive native  (*.nat *.NAT);;Envisat Image Format (*.n1 *.N1);;Erdas Imagine Images  (*.img *.IMG);;FARSITE v.4 Landscape File  (*.lcp *.LCP);;GMT NetCDF Grid Format (*.nc *.NC);;GRIdded Binary  (*.grb *.GRB);;GeoPackage (*.gpkg *.GPKG);;GeoSoft Grid Exchange Format (*.gxf *.GXF);;GeoTIFF (*.tif *.tiff *.TIF *.TIFF);;Geospatial PDF (*.pdf *.PDF);;Golden Software 7 Binary Grid  (*.grd *.GRD);;Golden Software ASCII Grid  (*.grd *.GRD);;Golden Software Binary Grid  (*.grd *.GRD);;Graphics Interchange Format  (*.gif *.GIF);;Ground-based SAR Applications Testbed File Format  (*.gff *.GFF);;HF2/HFZ heightfield raster (*.hf2 *.HF2);;Hierarchical Data Format Release 4 (*.hdf *.HDF);;Hierarchical Data Format Release 5 (*.hdf5 *.HDF5);;ILWIS Raster Map (*.mpr *.mpl *.MPR *.MPL);;IRIS data  (*.ppi *.PPI);;Idrisi Raster A.1 (*.rst *.RST);;JPEG JFIF (*.jpg *.jpeg *.JPG *.JPEG);;JPEG-2000 driver based on OpenJPEG library (*.jp2 *.j2k *.JP2 *.J2K);;Japanese DEM  (*.mem *.MEM);;KOLOR Raw (*.kro *.KRO);;Leveller heightfield (*.ter *.TER);;MBTiles (*.mbtiles *.MBTILES);;MS Windows Device Independent Bitmap (*.bmp *.BMP);;Magellan topo  (*.blx *.BLX);;NOAA NGS Geoid Height Grids (*.bin *.BIN);;NOAA Vertical Datum .GTX (*.gtx *.GTX);;NTv2 Datum Grid Shift (*.gsb *.GSB);;National Imagery Transmission Format (*.ntf *.NTF);;Network Common Data Format (*.nc *.NC);;Northwood Classified Grid Format .grc/.tab (*.grc *.GRC);;Northwood Numeric Grid Format .grd/.tab (*.grd *.GRD);;PCIDSK Database File (*.pix *.PIX);;PCRaster Raster File (*.map *.MAP);;Portable Network Graphics (*.png *.PNG);;Portable Pixmap Format  (*.pnm *.PNM);;R Object Data Store (*.rda *.RDA);;R Raster (*.grd *.GRD);;Racurs PHOTOMOD PRF (*.prf *.PRF);;Raster Matrix Format (*.rsw *.RSW);;Raster Product Format TOC format (*.toc *.TOC);;Rasterlite (*.sqlite *.SQLITE);;SAGA GIS Binary Grid  (*.sdat *.SDAT);;SDTS Raster (*.ddf *.DDF);;SGI Image File Format 1.0 (*.rgb *.RGB);;SRTMHGT File Format (*.hgt *.HGT);;Snow Data Assimilation System (*.hdr *.HDR);;Standard Raster Product  (*.img *.IMG);;Swedish Grid RIK  (*.rik *.RIK);;Terragen heightfield (*.ter *.TER);;USGS Astrogeology ISIS cube  (*.lbl *.cub *.LBL *.CUB);;USGS Optional ASCII DEM  (*.dem *.DEM);;VTP .bt (Binary Terrain) 1.3 Format (*.bt *.BT);;Vexcel MFF Raster (*.hdr *.HDR);;Virtual Raster (*.vrt *.ovr *.VRT *.OVR);;WEBP (*.webp *.WEBP);;X11 PixMap Format (*.xpm *.XPM);;ZMap Plus Grid (*.dat *.DAT)
../../src/providers/gdal/qgsgdalprovider.cpp: 2341: (buildSupportedRasterFileFilterAndExtensions) [0ms] Raster extension list built: vrt ovr tif tiff ntf toc xml img gff asc ddf dt0 dt1 dt2 png jpg jpeg mem gif n1 xpm bmp pix map mprmpl rgb hgt ter ter nc nc hdf lbl cub jp2 j2k grb rsw nat rst grd grd grd hdr rda webp pdf sqlite mbtiles cal ct1 pnm hdr bt lcp gtx gsb ACE2 hdr kro grd bil rik dem gxf hdf5 grd grc gen img blx sdat xyz hf2 e00 dat bin ppi prf gpkg dwg zip gz tar tar.gz tgz
../../src/core/qgsproviderregistry.cpp: 225: (init) [0ms] raster filters: All files (*);;GDAL/OGR VSIFileHandler (*.zip *.gz *.tar *.tar.gz *.tgz *.ZIP *.GZ *.TAR *.TAR.GZ *.TGZ);;ACE2 (*.ace2 *.ACE2);;ARC Digitized Raster Graphics (*.gen *.GEN);;ASCII Gridded XYZ (*.xyz *.XYZ);;Arc/Info ASCII Grid (*.asc *.ASC);;Arc/Info Binary Grid (hdr.adf HDR.ADF);;Arc/Info Export E00 GRID (*.e00 *.E00);;AutoCAD Driver (*.dwg *.DWG);;CALS  (*..cal *..ct1 *..CAL *..CT1);;DRDC COASP SAR Processor Raster (*.hdr *.HDR);;DTED Elevation Raster (*.dt0 *.dt1 *.dt2 *.DT0 *.DT1 *.DT2);;ECRG TOC format (*.xml *.XML);;ESRI .hdr Labelled (*.bil *.BIL);;EUMETSAT Archive native  (*.nat *.NAT);;Envisat Image Format (*.n1 *.N1);;Erdas Imagine Images  (*.img *.IMG);;FARSITE v.4 Landscape File  (*.lcp *.LCP);;GMT NetCDF Grid Format (*.nc *.NC);;GRIdded Binary  (*.grb *.GRB);;GeoPackage (*.gpkg *.GPKG);;GeoSoft Grid Exchange Format (*.gxf *.GXF);;GeoTIFF (*.tif *.tiff *.TIF *.TIFF);;Geospatial PDF (*.pdf *.PDF);;Golden Software 7 Binary Grid  (*.grd *.GRD);;Golden Software ASCII Grid  (*.grd *.GRD);;Golden Software Binary Grid  (*.grd *.GRD);;Graphics Interchange Format  (*.gif *.GIF);;Ground-based SAR Applications Testbed File Format  (*.gff *.GFF);;HF2/HFZ heightfield raster (*.hf2 *.HF2);;Hierarchical Data Format Release 4 (*.hdf *.HDF);;Hierarchical Data Format Release 5 (*.hdf5 *.HDF5);;ILWIS Raster Map (*.mpr *.mpl *.MPR *.MPL);;IRIS data  (*.ppi *.PPI);;Idrisi Raster A.1 (*.rst *.RST);;JPEG JFIF (*.jpg *.jpeg *.JPG *.JPEG);;JPEG-2000 driver based on OpenJPEG library (*.jp2 *.j2k *.JP2 *.J2K);;Japanese DEM  (*.mem *.MEM);;KOLOR Raw (*.kro *.KRO);;Leveller heightfield (*.ter *.TER);;MBTiles (*.mbtiles *.MBTILES);;MS Windows Device Independent Bitmap (*.bmp *.BMP);;Magellan topo  (*.blx *.BLX);;NOAA NGS Geoid Height Grids (*.bin *.BIN);;NOAA Vertical Datum .GTX (*.gtx *.GTX);;NTv2 Datum Grid Shift (*.gsb *.GSB);;National Imagery Transmission Format (*.ntf *.NTF);;Network Common Data Format (*.nc *.NC);;Northwood Classified Grid Format .grc/.tab (*.grc *.GRC);;Northwood Numeric Grid Format .grd/.tab (*.grd *.GRD);;PCIDSK Database File (*.pix *.PIX);;PCRaster Raster File (*.map *.MAP);;Portable Network Graphics (*.png *.PNG);;Portable Pixmap Format  (*.pnm *.PNM);;R Object Data Store (*.rda *.RDA);;R Raster (*.grd *.GRD);;Racurs PHOTOMOD PRF (*.prf *.PRF);;Raster Matrix Format (*.rsw *.RSW);;Raster Product Format TOC format (*.toc *.TOC);;Rasterlite (*.sqlite *.SQLITE);;SAGA GIS Binary Grid  (*.sdat *.SDAT);;SDTS Raster (*.ddf *.DDF);;SGI Image File Format 1.0 (*.rgb *.RGB);;SRTMHGT File Format (*.hgt *.HGT);;Snow Data Assimilation System (*.hdr *.HDR);;Standard Raster Product  (*.img *.IMG);;Swedish Grid RIK  (*.rik *.RIK);;Terragen heightfield (*.ter *.TER);;USGS Astrogeology ISIS cube  (*.lbl *.cub *.LBL *.CUB);;USGS Optional ASCII DEM  (*.dem *.DEM);;VTP .bt (Binary Terrain) 1.3 Format (*.bt *.BT);;Vexcel MFF Raster (*.hdr *.HDR);;Virtual Raster (*.vrt *.ovr *.VRT *.OVR);;WEBP (*.webp *.WEBP);;X11 PixMap Format (*.xpm *.XPM);;ZMap Plus Grid (*.dat *.DAT)
../../src/core/qgsproviderregistry.cpp: 229: (init) [0ms] Checking /usr/lib/qgis/plugins/libgdalprovider.so: ...loaded OK (76 file filters)
../../src/core/qgsproviderregistry.cpp: 146: (init) [3ms] Checking /usr/lib/qgis/plugins/libgeometrycheckerplugin.so: ...invalid (has type method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [4ms] Checking /usr/lib/qgis/plugins/libgeorefplugin.so: ...invalid (has type method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [2ms] Checking /usr/lib/qgis/plugins/libgpsimporterplugin.so: ...invalid (has type method)
../../src/core/qgsproviderregistry.cpp: 137: (init) [2ms] Checking /usr/lib/qgis/plugins/libgrassplugin7.so: ...invalid (lib not loadable): Cannot load library /usr/lib/qgis/plugins/libgrassplugin7.so: (libgrass_gis.7.2.2.so: cannot open shared object file: No such file or directory)
../../src/core/qgsproviderregistry.cpp: 137: (init) [0ms] Checking /usr/lib/qgis/plugins/libgrassprovider7.so: ...invalid (lib not loadable): Cannot load library /usr/lib/qgis/plugins/libgrassprovider7.so: (libgrass_gis.7.2.2.so: cannot open shared object file: No such file or directory)
../../src/core/qgsproviderregistry.cpp: 137: (init) [0ms] Checking /usr/lib/qgis/plugins/libgrassrasterprovider7.so: ...invalid (lib not loadable): Cannot load library /usr/lib/qgis/plugins/libgrassrasterprovider7.so: (libgrass_gis.7.2.2.so: cannot open shared object file: No such file or directory)
../../src/core/qgsproviderregistry.cpp: 154: (init) [2ms] Checking /usr/lib/qgis/plugins/libidentcertauthmethod.so: ...invalid (no isProvider method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [4ms] Checking /usr/lib/qgis/plugins/libofflineeditingplugin.so: ...invalid (has type method)
../../src/providers/ogr/qgsogrprovider.cpp: 2327: (createFilters) [3ms] Driver count: 80
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver OGR_SDTS for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver Memory for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [2ms] Unknown driver OGR_DODS for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver OGR_OGDI for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [2ms] Unknown driver GPSBabel for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver OGR_PDS for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver WFS for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver AeronavFAA for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver GFT for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver Cloudant for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver ElasticSearch for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver Walk for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver Carto for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver AmigoCloud for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver Selafin for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver PLSCENES for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [0ms] Unknown driver CSW for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2702: (createFilters) [1ms] Unknown driver HTTP for file filters.
../../src/providers/ogr/qgsogrprovider.cpp: 2709: (createFilters) [0ms] myFileFilters: PCI Geomatics Database File (*.pix *.PIX);;Network Common Data Format (*.nc *.NC);;Geospatial PDF (*.pdf *.PDF);;ESRI Shapefiles (*.shp *.SHP);;Mapinfo File (*.mif *.tab *.MIF *.TAB);;S-57 Base file (*.000 *.000);;Microstation DGN (*.dgn *.DGN);;VRT - Virtual Datasource (*.vrt *.ovf *.VRT *.OVF);;EPIInfo .REC  (*.rec *.REC);;Atlas BNA (*.bna *.BNA);;Comma Separated Value (*.csv *.CSV);;NAS - ALKIS (*.xml *.XML);;Geography Markup Language [GML] (*.gml *.GML);;GPS eXchange Format [GPX] (*.gpx *.GPX);;Keyhole Markup Language [KML] (*.kml *.kmz *.KML *.KMZ);;GeoJSON (*.geojson *.GEOJSON);;INTERLIS 1 (*.itf *.xml *.ili *.ITF *.XML *.ILI);;INTERLIS 2 (*.xtf *.xml *.ili *.XTF *.XML *.ILI);;GMT ASCII Vectors (.gmt) (*.gmt *.GMT);;GeoPackage (*.gpkg *.GPKG);;SQLite/SpatiaLite (*.sqlite *.db *.sqlite3 *.db3 *.s3db *.sl3 *.SQLITE *.DB *.SQLITE3 *.DB3 *.S3DB *.SL3);;WAsP (*.map *.MAP);;X-Plane/Flightgear (apt.dat nav.dat fix.dat awy.dat APT.DAT NAV.DAT FIX.DAT AWY.DAT);;AutoCAD DXF (*.dxf *.DXF);;AutoCAD Driver (*.dwg *.DWG);;Geoconcept (*.gxt *.txt *.GXT *.TXT);;GeoRSS (*.xml *.XML);;GPSTrackMaker (*.gtm *.gtz *.GTM *.GTZ);;Czech Cadastral Exchange Data Format (*.vfk *.VFK);;PostgreSQL SQL dump (*.sql *.SQL);;OpenStreetMap (*.osm *.pbf *.OSM *.PBF);;Special Use Airspace Format (*.sua *.SUA);;OpenAir Special Use Airspace Format (*.txt *.TXT);;Systematic Organization of Spatial Information [SOSI] (*.sos *.SOS);;Hydrographic Transfer Format (*.htf *.HTF);;Geomedia .mdb (*.mdb *.MDB);;EDIGEO (*.thf *.THF);;Scalable Vector Graphics (*.svg *.SVG);;Idrisi Vector (.vct) (*.vct *.VCT);;Arc/Info Generate (*.gen *.GEN);;SEG-P1 (*.seg *.seg1 *.sp1 *.SEG *.SEG1 *.SP1);;UKOOA P1/90 (*.uko *.ukooa *.UKO *.UKOOA);;SEG-Y (*.sgy *.segy *.SGY *.SEGY);;MS Excel format (*.xls *.XLS);;Open Document Spreadsheet (*.ods *.ODS);;MS Office Open XML spreadsheet (*.xlsx *.XLSX);;Storage and eXchange Format (*.sxf *.SXF);;OpenJUMP JML (*.jml *.JML);;VDV-451/VDV-452/INTREST Data Format (*.txt *.x10 *.TXT *.X10);;Arc/Info ASCII Coverage (*.e00 *.E00);;
../../src/providers/ogr/qgsogrprovider.cpp: 2713: (createFilters) [0ms] myFileFilters: Arc/Info ASCII Coverage (*.e00 *.E00);;Arc/Info Generate (*.gen *.GEN);;Atlas BNA (*.bna *.BNA);;AutoCAD DXF (*.dxf *.DXF);;AutoCAD Driver (*.dwg *.DWG);;Comma Separated Value (*.csv *.CSV);;Czech Cadastral Exchange Data Format (*.vfk *.VFK);;EDIGEO (*.thf *.THF);;EPIInfo .REC  (*.rec *.REC);;ESRI Shapefiles (*.shp *.SHP);;GMT ASCII Vectors (.gmt) (*.gmt *.GMT);;GPS eXchange Format [GPX] (*.gpx *.GPX);;GPSTrackMaker (*.gtm *.gtz *.GTM *.GTZ);;GeoJSON (*.geojson *.GEOJSON);;GeoPackage (*.gpkg *.GPKG);;GeoRSS (*.xml *.XML);;Geoconcept (*.gxt *.txt *.GXT *.TXT);;Geography Markup Language [GML] (*.gml *.GML);;Geomedia .mdb (*.mdb *.MDB);;Geospatial PDF (*.pdf *.PDF);;Hydrographic Transfer Format (*.htf *.HTF);;INTERLIS 1 (*.itf *.xml *.ili *.ITF *.XML *.ILI);;INTERLIS 2 (*.xtf *.xml *.ili *.XTF *.XML *.ILI);;Idrisi Vector (.vct) (*.vct *.VCT);;Keyhole Markup Language [KML] (*.kml *.kmz *.KML *.KMZ);;MS Excel format (*.xls *.XLS);;MS Office Open XML spreadsheet (*.xlsx *.XLSX);;Mapinfo File (*.mif *.tab *.MIF *.TAB);;Microstation DGN (*.dgn *.DGN);;NAS - ALKIS (*.xml *.XML);;Network Common Data Format (*.nc *.NC);;Open Document Spreadsheet (*.ods *.ODS);;OpenAir Special Use Airspace Format (*.txt *.TXT);;OpenJUMP JML (*.jml *.JML);;OpenStreetMap (*.osm *.pbf *.OSM *.PBF);;PCI Geomatics Database File (*.pix *.PIX);;PostgreSQL SQL dump (*.sql *.SQL);;S-57 Base file (*.000 *.000);;SEG-P1 (*.seg *.seg1 *.sp1 *.SEG *.SEG1 *.SP1);;SEG-Y (*.sgy *.segy *.SGY *.SEGY);;SQLite/SpatiaLite (*.sqlite *.db *.sqlite3 *.db3 *.s3db *.sl3 *.SQLITE *.DB *.SQLITE3 *.DB3 *.S3DB *.SL3);;Scalable Vector Graphics (*.svg *.SVG);;Special Use Airspace Format (*.sua *.SUA);;Storage and eXchange Format (*.sxf *.SXF);;Systematic Organization of Spatial Information [SOSI] (*.sos *.SOS);;UKOOA P1/90 (*.uko *.ukooa *.UKO *.UKOOA);;VDV-451/VDV-452/INTREST Data Format (*.txt *.x10 *.TXT *.X10);;VRT - Virtual Datasource (*.vrt *.ovf *.VRT *.OVF);;WAsP (*.map *.MAP);;X-Plane/Flightgear (apt.dat nav.dat fix.dat awy.dat APT.DAT NAV.DAT FIX.DAT AWY.DAT);;
../../src/providers/ogr/qgsogrprovider.cpp: 2733: (createFilters) [0ms] myFileFilters: All files (*);;GDAL/OGR VSIFileHandler (*.zip *.gz *.tar *.tar.gz *.tgz *.ZIP *.GZ *.TAR *.TAR.GZ *.TGZ);;Arc/Info ASCII Coverage (*.e00 *.E00);;Arc/Info Generate (*.gen *.GEN);;Atlas BNA (*.bna *.BNA);;AutoCAD DXF (*.dxf *.DXF);;AutoCAD Driver (*.dwg *.DWG);;Comma Separated Value (*.csv *.CSV);;Czech Cadastral Exchange Data Format (*.vfk *.VFK);;EDIGEO (*.thf *.THF);;EPIInfo .REC  (*.rec *.REC);;ESRI Shapefiles (*.shp *.SHP);;GMT ASCII Vectors (.gmt) (*.gmt *.GMT);;GPS eXchange Format [GPX] (*.gpx *.GPX);;GPSTrackMaker (*.gtm *.gtz *.GTM *.GTZ);;GeoJSON (*.geojson *.GEOJSON);;GeoPackage (*.gpkg *.GPKG);;GeoRSS (*.xml *.XML);;Geoconcept (*.gxt *.txt *.GXT *.TXT);;Geography Markup Language [GML] (*.gml *.GML);;Geomedia .mdb (*.mdb *.MDB);;Geospatial PDF (*.pdf *.PDF);;Hydrographic Transfer Format (*.htf *.HTF);;INTERLIS 1 (*.itf *.xml *.ili *.ITF *.XML *.ILI);;INTERLIS 2 (*.xtf *.xml *.ili *.XTF *.XML *.ILI);;Idrisi Vector (.vct) (*.vct *.VCT);;Keyhole Markup Language [KML] (*.kml *.kmz *.KML *.KMZ);;MS Excel format (*.xls *.XLS);;MS Office Open XML spreadsheet (*.xlsx *.XLSX);;Mapinfo File (*.mif *.tab *.MIF *.TAB);;Microstation DGN (*.dgn *.DGN);;NAS - ALKIS (*.xml *.XML);;Network Common Data Format (*.nc *.NC);;Open Document Spreadsheet (*.ods *.ODS);;OpenAir Special Use Airspace Format (*.txt *.TXT);;OpenJUMP JML (*.jml *.JML);;OpenStreetMap (*.osm *.pbf *.OSM *.PBF);;PCI Geomatics Database File (*.pix *.PIX);;PostgreSQL SQL dump (*.sql *.SQL);;S-57 Base file (*.000 *.000);;SEG-P1 (*.seg *.seg1 *.sp1 *.SEG *.SEG1 *.SP1);;SEG-Y (*.sgy *.segy *.SGY *.SEGY);;SQLite/SpatiaLite (*.sqlite *.db *.sqlite3 *.db3 *.s3db *.sl3 *.SQLITE *.DB *.SQLITE3 *.DB3 *.S3DB *.SL3);;Scalable Vector Graphics (*.svg *.SVG);;Special Use Airspace Format (*.sua *.SUA);;Storage and eXchange Format (*.sxf *.SXF);;Systematic Organization of Spatial Information [SOSI] (*.sos *.SOS);;UKOOA P1/90 (*.uko *.ukooa *.UKO *.UKOOA);;VDV-451/VDV-452/INTREST Data Format (*.txt *.x10 *.TXT *.X10);;VRT - Virtual Datasource (*.vrt *.ovf *.VRT *.OVF);;WAsP (*.map *.MAP);;X-Plane/Flightgear (apt.dat nav.dat fix.dat awy.dat APT.DAT NAV.DAT FIX.DAT AWY.DAT)
../../src/core/qgsproviderregistry.cpp: 213: (init) [0ms] Checking /usr/lib/qgis/plugins/libogrprovider.so: ...loaded OK (52 file filters)
../../src/core/qgsproviderregistry.cpp: 154: (init) [4ms] Checking /usr/lib/qgis/plugins/libpkcs12authmethod.so: ...invalid (no isProvider method)
../../src/core/qgsproviderregistry.cpp: 154: (init) [2ms] Checking /usr/lib/qgis/plugins/libpkipathsauthmethod.so: ...invalid (no isProvider method)
../../src/core/qgsproviderregistry.cpp: 146: (init) [6ms] Checking /usr/lib/qgis/plugins/libtopolplugin.so: ...invalid (has type method)
../../src/providers/wfs/qgswfsutils.cpp: 212: (init) [6ms] Keep-alive mechanism works
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [3ms] Library name is /usr/lib/qgis/plugins/libdb2provider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libwfsprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libwfsprovider.so does not have dataCapabilities
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libarcgisfeatureserverprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libarcgismapserverprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libdelimitedtextprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libdelimitedtextprovider.so does not have dataCapabilities
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libgdalprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libgeonodeprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libgeonodeprovider.so does not have dataCapabilities
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libgpxprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libgpxprovider.so does not have dataCapabilities
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libmssqlprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libogrprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libowsprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libpostgresprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libspatialiteprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [1ms] Library name is /usr/lib/qgis/plugins/libvirtuallayerprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libvirtuallayerprovider.so does not have dataCapabilities
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libwcsprovider.so
../../src/core/qgsproviderregistry.cpp: 496: (createProviderLibrary) [0ms] Library name is /usr/lib/qgis/plugins/libwmsprovider.so
../../src/core/qgsdataitemproviderregistry.cpp: 103: (QgsDataItemProviderRegistry) [0ms] /usr/lib/qgis/plugins/libwmsprovider.so does not have dataCapabilities
../../src/core/auth/qgsauthmanager.cpp: 143: (init) [0ms] Initializing QCA...
../../src/core/auth/qgsauthmanager.cpp: 146: (init) [0ms] QCA initialized.
../../src/core/auth/qgsauthmanager.cpp: 149: (init) [1ms] QCA Plugin Diagnostics Context: Checking Qt static plugins:
  (none)
Checking Qt Library Path: /usr/lib/qgis/plugins
  (No 'crypto' subdirectory)
Checking Qt Library Path: /usr/lib/x86_64-linux-gnu/qt5/plugins
  (No 'crypto' subdirectory)
Checking Qt Library Path: /usr/bin
  (No 'crypto' subdirectory)
Checking Qt Library Path: /usr/lib/x86_64-linux-gnu/qca-qt5
  libqca-cyrus-sasl.so: (class: saslPlugin) loaded as qca-cyrus-sasl
  libqca-gnupg.so: (class: gnupgPlugin) loaded as qca-gnupg
  libqca-logger.so: (class: loggerPlugin) loaded as qca-logger
  libqca-ossl.so: (class: opensslPlugin) loaded as qca-ossl
  libqca-softstore.so: (class: softstorePlugin) loaded as qca-softstore

../../src/core/auth/qgsauthmanager.cpp: 153: (init) [1ms] QCA supports: random,md5,sha1,keystorelist,sasl,pgpkey,openpgp,log,sha0,ripemd160,md4,sha224,sha256,sha384,sha512,hmac(md5),hmac(sha1),hmac(sha224),hmac(sha256),hmac(sha384),hmac(sha512),hmac(ripemd160),aes128-ecb,aes128-cfb,aes128-cbc,aes128-cbc-pkcs7,aes128-ofb,aes128-ctr,aes192-ecb,aes192-cfb,aes192-cbc,aes192-cbc-pkcs7,aes192-ofb,aes192-ctr,aes256-ecb,aes256-cbc,aes256-cbc-pkcs7,aes256-cfb,aes256-ofb,aes256-ctr,blowfish-ecb,blowfish-cbc-pkcs7,blowfish-cbc,blowfish-cfb,blowfish-ofb,tripledes-ecb,tripledes-cbc,des-ecb,des-ecb-pkcs7,des-cbc,des-cbc-pkcs7,des-cfb,des-ofb,cast5-ecb,cast5-cbc,cast5-cbc-pkcs7,cast5-cfb,cast5-ofb,pbkdf1(sha1),pbkdf2(sha1),pkey,dlgroup,rsa,dsa,dh,cert,csr,crl,certcollection,pkcs12,tls,cms,ca
../../src/core/auth/qgsauthmanager.cpp: 163: (init) [1ms] Prioritizing qca-ossl over all other QCA providers...
../../src/core/auth/qgsauthmanager.cpp: 177: (init) [0ms] QCA provider priorities: qca-cyrus-sasl:1, qca-gnupg:1, qca-logger:1, qca-ossl:0, qca-softstore:1
../../src/core/auth/qgsauthmanager.cpp: 179: (init) [0ms] Populating auth method registry
../../src/core/auth/qgsauthmethodregistry.cpp: 66: (QgsAuthMethodRegistry) [0ms] Checking for auth method plugins in: /usr/lib/qgis/plugins
../../src/core/auth/qgsauthmanager.cpp: 184: (init) [0ms] Authentication methods found: Basic, Identity-Cert, PKI-PKCS#12, PKI-Paths
../../src/core/auth/qgsauthmethodregistry.cpp: 289: (authMethod) [0ms] Auth method library name is /usr/lib/qgis/plugins/libbasicauthmethod.so
../../src/core/auth/qgsauthmethodregistry.cpp: 311: (authMethod) [0ms] Instantiated the auth method plugin: Basic
../../src/core/auth/qgsauthmethodregistry.cpp: 289: (authMethod) [1ms] Auth method library name is /usr/lib/qgis/plugins/libidentcertauthmethod.so
../../src/core/auth/qgsauthmethodregistry.cpp: 311: (authMethod) [0ms] Instantiated the auth method plugin: Identity-Cert
../../src/core/auth/qgsauthmethodregistry.cpp: 289: (authMethod) [0ms] Auth method library name is /usr/lib/qgis/plugins/libpkcs12authmethod.so
../../src/core/auth/qgsauthmethodregistry.cpp: 311: (authMethod) [0ms] Instantiated the auth method plugin: PKI-PKCS#12
../../src/core/auth/qgsauthmethodregistry.cpp: 289: (authMethod) [0ms] Auth method library name is /usr/lib/qgis/plugins/libpkipathsauthmethod.so
../../src/core/auth/qgsauthmethodregistry.cpp: 311: (authMethod) [0ms] Instantiated the auth method plugin: PKI-Paths
../../src/core/auth/qgsauthmanager.cpp: 201: (init) [0ms] Auth database path: /home/user/.local/share/profiles/default/qgis-auth.db
../../src/core/auth/qgsauthmanager.cpp: 205: (init) [0ms] Auth db directory path: /home/user/.local/share/profiles/default
../../src/core/auth/qgsauthmanager.cpp: 230: (init) [0ms] Auth db exists and has data
../../src/core/auth/qgsauthmanager.cpp: 362: (createCertTables) [0ms] Creating cert tables in auth db
../../src/core/auth/qgsauthmanager.cpp: 927: (updateConfigAuthMethods) [1ms] Synching existing auth config and their auth methods
../../src/core/auth/qgsauthmanager.cpp: 936: (updateConfigAuthMethods) [0ms] Stored auth config/methods:

../../src/core/auth/qgsauthmanager.cpp: 2545: (rebuildCaCertsCache) [43ms] Rebuild of CA certs cache SUCCEEDED
../../src/core/auth/qgsauthmanager.cpp: 2750: (rebuildCertTrustCache) [0ms] Rebuild of cert trust policy cache SUCCEEDED
../../src/core/auth/qgsauthmanager.cpp: 2818: (rebuildTrustedCaCertsCache) [4ms] Rebuilt trusted cert authorities cache
../../src/core/auth/qgsauthmanager.cpp: 2302: (rebuildIgnoredSslErrorCache) [0ms] Rebuild of ignored SSL errors cache SAME AS BEFORE
../../src/core/auth/qgsauthmanager.cpp: 2169: (dumpIgnoredSslErrorsCache_) [0ms] Ignored SSL errors cache EMPTY
../../src/core/auth/qgsauthmanager.cpp: 1666: (initSslCaches) [0ms] Init of SSL caches SUCCEEDED
../../src/core/qgsnetworkaccessmanager.cpp: 163: (setFallbackProxyAndExcludes) [5ms] proxy settings: (type:DefaultProxy host: :0, user:, password:not set
../../src/core/qgsnetworkaccessmanager.cpp: 390: (setupDefaultProxyAndCache) [0ms] cacheDirectory: /home/user/.local/share/profiles/default/cache/
../../src/core/qgsnetworkaccessmanager.cpp: 391: (setupDefaultProxyAndCache) [0ms] maximumCacheSize: 52428800
/home/user/.local/share/profiles/default/
user@qgisnightly:~$
</pre>


See what I mean? ;)

The debug messages are going to stderr which can be leveraged to set font or color with escape sequences. The following makes the wanted print() output bold:

<pre>
python3 sample.py 2> >(while read line; do echo -e "\e[0m$line" >&2; done) 1> >(while read line; do echo -e "\e[01m$line\e[0m" >&2; done)
</pre>


<pre>
user@qgisnightly:~$ python3 sample.py
../../src/core/qgsproviderregistry.cpp: 101: (init) [0ms] Checking /usr/lib/qgis/plugins for provider plugins
<snip />
../../src/core/qgsnetworkaccessmanager.cpp: 391: (setupDefaultProxyAndCache) [0ms] maximumCacheSize: 52428800
<b>/home/user/.local/share/profiles/default/</b>
user@qgisnightly:~$
</pre>

Most likely the debug messages are not needed, especially when porting a Python script to QGIS 3. As they are coming through Qt methods they can be influenced with Qt settings (see http://doc.qt.io/qt-5/qloggingcategory.html).

<pre>
user@qgisnightly:~$  export QT_LOGGING_RULES="*.debug=false" && python3 sample.py
/home/user/.local/share/profiles/default/
user@qgisnightly:~$ 
</pre>

Future versions of Qt will even allow to specify multiple rules separated with a semicolon.

