<?php

Route::group(['namespace' => 'Abs\LocationPkg', 'middleware' => ['web'], 'prefix' => 'location-pkg'], function () {
	Route::post('/state/get', 'StateController@getStates')->name('getStates');
});

Route::group(['namespace' => 'Abs\LocationPkg', 'middleware' => ['web', 'auth'], 'prefix' => 'location-pkg'], function () {

	//COUNTRY
	Route::get('/countries/get-list', 'CountryController@getCountryPkgList')->name('getCountryPkgList');
	Route::get('/country/get-form-data', 'CountryController@getCountryFormData')->name('getCountryFormData');
	Route::post('/country/save', 'CountryController@savePkgCountry')->name('savePkgCountry');
	Route::get('/country/delete', 'CountryController@deleteCountryPkg')->name('deleteCountryPkg');
	Route::get('/country/view', 'CountryController@viewCountryPkg')->name('viewCountryPkg');
	Route::post('/countries/get', 'CountryController@getCountries')->name('getCountries');

	//STATE
	Route::get('/states/get-list', 'StateController@getStatePkgList')->name('getStatePkgList');
	Route::get('/state/get-form-data', 'StateController@getStateFormData')->name('getStateFormData');
	Route::post('/state/save', 'StateController@saveStatePkg')->name('saveStatePkg');
	Route::get('/state/delete', 'StateController@deleteStatePkg')->name('deleteStatePkg');
	Route::get('/state/view', 'StateController@viewStatePkg')->name('viewStatePkg');
	Route::get('/state/state-filter', 'StateController@getStateFilter')->name('getStateFilter');

	//CITY
	Route::get('/cities/get-list', 'CityController@getCityPkgList')->name('getCityPkgList');
	Route::get('/city/get-form-data', 'CityController@getCityFormData')->name('getCityFormData');
	Route::post('/city/save', 'CityController@saveCity')->name('saveCity');
	Route::get('/city/delete', 'CityController@deleteCityPkg')->name('deleteCityPkg');
	Route::get('/city/view', 'CityController@viewCityPkg')->name('viewCityPkg');
	Route::get('/city/city-filter', 'CityController@getCityFilter')->name('getCityFilter');

	//REGION
	Route::get('/regions/get-list', 'RegionController@getRegionPkgList')->name('getRegionPkgList');
	Route::get('/region/get-form-data', 'RegionController@getRegionFormData')->name('getRegionFormData');
	Route::post('/region/save', 'RegionController@saveRegionPkg')->name('saveRegionPkg');
	Route::get('/region/delete', 'RegionController@deleteRegionPkg')->name('deleteRegionPkg');
	Route::get('/region/view', 'RegionController@viewRegionPkg')->name('viewRegionPkg');
	Route::get('/region/get-filter', 'RegionController@getRegionFilter')->name('getRegionFilter');
	Route::post('/region/get-region-list', 'RegionController@getRegions')->name('getRegions');

	//GET STATE BASED COUNTRY
	Route::get('/states/get-state', 'StateController@getStateBasedCountry')->name('getStateBasedCountry');
	//GET CITY BASED STATE
	Route::get('/city/get-city', 'CityController@getCityBasedState')->name('getCityBasedState');

});
