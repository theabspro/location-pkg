app.component('regionListPkg', {
    templateUrl: region_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $element, $mdSelect) {
        $scope.loading = true;
        var self = this;
        self.theme = admin_theme;
        self.hasPermission = HelperService.hasPermission;
        $('#search_region').focus();
        $('li').removeClass('active');
        $('.master_link').addClass('active').trigger('click');
        self.add_permission = self.hasPermission('add-region');
        if (!self.hasPermission('regions')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        var table_scroll;
        table_scroll = $('.page-main-content.list-page-content').height() - 37;
        var dataTable = $('#regions_list').DataTable({
            "dom": cndn_dom_structure,
            "language": {
                "search": "",
                "searchPlaceholder": "Search",
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
                    $('#search_region').val(state_save_val.search.search);
                }
                return JSON.parse(localStorage.getItem('CDataTables_' + settings.sInstance));
            },
            serverSide: true,
            paging: true,
            stateSave: true,
            scrollY: table_scroll + "px",
            scrollCollapse: true,
            ajax: {
                url: laravel_routes['getRegionPkgList'],
                type: "GET",
                dataType: "json",
                data: function(d) {
                    d.region_code = $('#code').val();
                    d.region_name = $('#filter_name').val();
                    d.filter_state_id = $('#filter_state_id').val();
                    d.status = $('#status').val();
                },
            },

            columns: [
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'name', name: 'regions.name' },
                { data: 'code', name: 'regions.code' },
                { data: 'state_name', name: 'states.name' },
                { data: 'state_code', name: 'states.code' },
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
            $('#regions_list').DataTable().ajax.reload();
        });

        $scope.clear_search = function() {
            $('#search_city').val('');
            $('#regions_list').DataTable().search('').draw();
        }

        var dataTables = $('#regions_list').dataTable();
        $("#search_region").keyup(function() {
            dataTables.fnFilter(this.value);
        });

        //DELETE
        $scope.deleteRegion = function($id) {
            $('#region_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#region_id').val();
            $http.get(
                laravel_routes['deleteRegionPkg'], {
                    params: {
                        id: $id,
                    }
                }
            ).then(function(response) {
                if (response.data.success) {
                    custom_noty('success', 'Region Deleted Successfully');
                    $('#regions_list').DataTable().ajax.reload(function(json) {});
                    $location.path('/location-pkg/region/list');
                    $('#search_region').focus();
                }
            });
        }

        //FOR FILTER
        $http.get(
            laravel_routes['getRegionFilter']
        ).then(function(response) {
            // console.log(response);
            self.state_list = response.data.state_list;
        });
        self.status = [
            { id: '', name: 'Select Status' },
            { id: '1', name: 'Active' },
            { id: '0', name: 'Inactive' },
        ];
        $element.find('input').on('keydown', function(ev) {
            ev.stopPropagation();
        });
        $scope.clearSearchTerm = function() {
            $scope.searchTerm = '';
            $scope.searchTerm1 = '';
        };
        /* Modal Md Select Hide */
        $('.modal').bind('click', function(event) {
            if ($('.md-select-menu-container').hasClass('md-active')) {
                $mdSelect.hide();
            }
        });

        var dataTables = $('#regions_list').dataTable();
        $('#code').on('keyup', function() {
            dataTables.fnFilter();
        });
        $('#filter_name').on('keyup', function() {
            dataTables.fnFilter();
        });
        $scope.onSelectedStatus = function(val) {
            $("#status").val(val);
            dataTables.fnFilter();
        }
        $scope.onSelectedState = function(val) {
            $("#filter_state_id").val(val);
            dataTables.fnFilter();
        }
        $scope.reset_filter = function() {
            $("#filter_name").val('');
            $("#code").val('');
            $("#filter_state_id").val('');
            $("#status").find('select').prop('selectedIndex', 0).trigger('change');
            dataTables.fnFilter();
        }

        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('regionFormPkg', {
    templateUrl: region_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        $('#name').focus();
        // $('li').removeClass('active');
        $('.master_link').addClass('active').trigger('click');
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('add-region') || !self.hasPermission('edit-region')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        $http.get(
            laravel_routes['getRegionFormData'], {
                params: {
                    id: typeof($routeParams.id) == 'undefined' ? null : $routeParams.id,
                }
            }
        ).then(function(response) {
            // console.log(response);
            self.region = response.data.region;
            self.state_list = response.data.state_list;
            self.theme = response.data.theme;
            self.action = response.data.action;
            $rootScope.loading = false;
            if (self.action == 'Edit') {
                if (self.region.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }
            } else {
                self.switch_value = 'Active';
            }
        });

        $.validator.addMethod("alpha", function(value, element) {
            return this.optional(element) || value == value.match(/^[a-zA-Z ]*$/);
        });
        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'code': {
                    required: true,
                    minlength: 1,
                    maxlength: 4,
                    alpha: true,
                },
                'name': {
                    required: true,
                    minlength: 3,
                    maxlength: 191,
                    alpha: true,
                },
                'state_id': {
                    required: true,
                },
            },
            messages: {
                'code': {
                    minlength: "Minimum 1 Character",
                    maxlength: "Maximum 4 Characters",
                    alpha: "Enter only alphabets",
                },
                'name': {
                    minlength: "Minimum 3 Characters",
                    maxlength: "Maximum 191 Characters",
                    alpha: "Enter only alphabets",
                },
            },
            // invalidHandler: function(event, validator) {
            //     custom_noty('error', 'You have errors, Please check all tabs');
            // },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveRegionPkg'],
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            custom_noty('success', res.message);
                            $location.path('/location-pkg/region/list');
                            $('#search_region').focus();

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
                                $location.path('/location-pkg/region/list');
                                $('#search_region').focus();

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
app.component('regionViewPkg', {
    templateUrl: region_view_template_url,
    controller: function($http, HelperService, $scope, $routeParams, $rootScope) {
        var self = this;
        // $('li').removeClass('active');
        $('.master_link').addClass('active').trigger('click');
        self.hasPermission = HelperService.hasPermission;
        if (!self.hasPermission('view-region')) {
            window.location = "#!/page-permission-denied";
            return false;
        }
        self.angular_routes = angular_routes;
        $http.get(
            laravel_routes['viewRegionPkg'], {
                params: {
                    id: $routeParams.id,
                }
            }
        ).then(function(response) {
            // console.log(response);
            self.region = response.data.region;
            self.action = response.data.action;
            self.theme = response.data.theme;
        });
    }
});