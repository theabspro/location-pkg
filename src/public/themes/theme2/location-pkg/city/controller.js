app.component('cityListPkg', {
    templateUrl: city_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element, $mdSelect) {
        $scope.loading = true;
        var self = this;
        $('#search_city').focus();
        $('li').removeClass('active');
        $('.master_link').addClass('active').trigger('click');
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('cities')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.add_permission = self.hasPermission('add-city');
        var table_scroll;
        table_scroll = $('.page-main-content.list-page-content').height() - 37;
        var dataTable = $('#city_list').DataTable({
            "dom": cndn_dom_structure,
            "language": {
                // "search": "",
                // "searchPlaceholder": "Search",
                "lengthMenu": "Rows _MENU_",
                "paginate": {
                    "next": '<i class="icon ion-ios-arrow-forward"></i>',
                    "previous": '<i class="icon ion-ios-arrow-back"></i>'
                },
            },
            pageLength: 10,
            processing: true,
            stateSaveCallback: function(settings, data) {
                localStorage.setItem('CDataTables_' + settings.sInstance, JSON.stringify(data));
            },
            stateLoadCallback: function(settings) {
                var state_save_val = JSON.parse(localStorage.getItem('CDataTables_' + settings.sInstance));
                if (state_save_val) {
                    $('#search_city').val(state_save_val.search.search);
                }
                return JSON.parse(localStorage.getItem('CDataTables_' + settings.sInstance));
            },
            serverSide: true,
            paging: true,
            stateSave: true,
            scrollY: table_scroll + "px",
            scrollCollapse: true,
            ajax: {
                url: laravel_routes['getCityPkgList'],
                type: "GET",
                dataType: "json",
                data: function(d) {
                    d.city_name = $('#filter_name').val();
                    d.filter_state_id = $('#filter_state_id').val();
                    d.country_id = $('#country_id').val();
                    d.status = $('#status').val();
                },
            },
            columns: [
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'name', name: 'cities.name' },
                { data: 'state_name', name: 'states.name' },
                { data: 'state_code', name: 'states.code' },
                { data: 'country_name', name: 'countries.name' },
                { data: 'country_code', name: 'countries.code' },
            ],
            "infoCallback": function(settings, start, end, max, total, pre) {
                $('#table_info').html(total)
                $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
            },
            rowCallback: function(row, data) {
                $(row).addClass('highlight-row');
            }
        });
        $('.dataTables_length select').select2();

        $('.refresh_table').on("click", function() {
            $('#city_list').DataTable().ajax.reload();
        });

        $scope.clear_search = function() {
            $('#search_city').val('');
            $('#city_list').DataTable().search('').draw();
        }

        var dataTables = $('#city_list').dataTable();
        $("#search_city").keyup(function() {
            dataTables.fnFilter(this.value);
        });

        //FOCUS ON SEARCH FIELD


        //DELETE
        $scope.deleteCity = function($id) {
            $('#city_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#city_id').val();
            $http.get(
                laravel_routes['deleteCityPkg'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                if (response.data.success) {
                    custom_noty('success', 'City Deleted Successfully');
                    $('#city_list').DataTable().ajax.reload(function(json) {});
                    $location.path('/location-pkg/city/list');
                    $('#search_city').focus();
                }
            });
        }

        //FOR FILTER
        $http.get(
            laravel_routes['getCityFilter']
        ).then(function(response) {
            // self.city_list = response.data.country_list;
            self.country_list = response.data.country_list;
        });
        self.status = [
            { id: '', name: 'Select Status' },
            { id: '1', name: 'Active' },
            { id: '0', name: 'Inactive' },
        ];
        self.state_list = [
            { id: '', name: 'Select State' }
        ];
        $element.find('input').on('keydown', function(ev) {
            ev.stopPropagation();
        });
        $scope.clearSearchTerm = function() {
            $scope.searchTerm = '';
            $scope.searchTerm1 = '';
            $scope.searchTerm2 = '';
        };
        /* Modal Md Select Hide */
        $('.modal').bind('click', function(event) {
            if ($('.md-select-menu-container').hasClass('md-active')) {
                $mdSelect.hide();
            }
        });

        //SELECT STATE BASED COUNTRY
        $scope.onSelectedCountry = function(id) {
            if (id) {
                self.state_list = [];
                $("#filter_country_id").val(id);
                datatables.fnFilter();
                $http.get(
                    laravel_routes['getStateBasedCountry'], {
                        params: {
                            country_id: id,
                        }
                    }
                ).then(function(response) {
                    angular.forEach(response.data.state_list, function(value, key) {
                        self.state_list.push({
                            id: value.id,
                            name: value.name,
                        });
                    });
                });
            }
        }

        var datatables = $('#city_list').dataTable();
        $('#filter_name').on('keyup', function() {
            datatables.fnFilter();
        });
        $scope.onSelectedStatus = function(id) {
            $("#status").val(id);
            datatables.fnFilter();
        }
        $scope.onSelectedState = function(id) {
            $("#filter_state_id").val(id);
            datatables.fnFilter();
        }
        $scope.reset_filter = function() {
            $("#filter_name").val('');
            $("#code").val('');
            $("#country_id").val('');
            $("#status").val('');
            $("#filter_state_id").val('');
            datatables.fnFilter();
        }

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('cityForm', {
    templateUrl: city_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element) {
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('add-city') || !self.hasPermission('edit-city')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        $('#name').focus();
        $('.master_link').addClass('active').trigger('click');
        self.angular_routes = angular_routes;
        $http.get(
            laravel_routes['getCityFormData'], {
                params: {
                    id: typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
                }
            }
        ).then(function(response) {
            // console.log(response);
            self.city = response.data.city;
            self.state_list = response.data.state_list;
            self.theme = response.data.theme;
            self.action = response.data.action;
            $rootScope.loading = false;
            if (self.action == 'Edit') {
                if (self.city.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }
            } else {
                self.switch_value = 'Active';
            }
        });

        $element.find('input').on('keydown', function(ev) {
            ev.stopPropagation();
        });

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'name': {
                    required: true,
                    minlength: 3,
                    maxlength: 255,
                },
                'state_id': {
                    required: true,
                },
            },
            messages: {
                'name': {
                    minlength: "Minimum 3 Characters",
                    maxlength: "Maximum 255 Characters",
                    alpha: "Enter only alphabets",
                },
            },
            // invalidHandler: function(event, validator) {
            //     custom_noty('error', 'You have errors,Please check all tabs');
            // },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveCity'],
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            custom_noty('success', res.message);
                            $location.path('/location-pkg/city/list');
                            $scope.$apply();
                        } else {
                            if (!res.success == true) {
                                $('#submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                custom_noty('error', errors);
                            } else {
                                $('#submit').button('reset');
                                $location.path('/location-pkg/city/list');
                                $('#search_city').focus();

                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('#submit').button('reset');
                        custom_noty('error', 'Something went wrong at server');
                    });
            }
        });
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('cityView', {
    templateUrl: city_view_template_url,
    controller: function($http, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        $('.master_link').addClass('active').trigger('click');
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('view-city')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        $http.get(
            laravel_routes['viewCityPkg'], {
                params: {
                    id: $routeParams.id,
                }
            }
        ).then(function(response) {
            // console.log(response);
            self.city = response.data.city;
            self.action = response.data.action;
            self.theme = response.data.theme;
        });
    }
});