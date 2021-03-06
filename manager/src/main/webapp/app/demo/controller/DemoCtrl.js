/**
 * @author   aliencode
 * @date     2014/7/23
 */

app.controller('DemoCtrl', function ($scope, $element, DemoService) {


    window.$scope = $scope;

    var viewPage = $($element),  //表示当前视图
        demoTable = DemoService.demo, //demo表对应的Rest服务API
        page = {limit: 5, page: 1},  //分页
        search = '',//公共查询,   默认为空
        sorting = {sort: 'updatedAt', 'updatedAt.dir': 'desc'};  //公共排序,   默认按更新时间降序


    /**
     * 保存数据
     */
    $scope.saveItem = function (e) {

        //校验表单
        if (!viewPage.find('.edit_modal form').valid()) {
            return;
        }

        //置提交按钮为加载中
        $(e.delegateTarget).sbutton('loading');

        //读取表单数据为一个js对像
        var data = viewPage.find('.edit_modal form').inputs('get');

        //根据id判断为更新还是添加
        var action = 'update';
        if (_.isEmpty(data.id)) {
            action = 'create'
        }

        //提交数据
        demoTable[action]({str: data.id, data: data}, function (result) {
            if (result.success) {

                alert('操作成功！');

                //置提交按钮为成功状态
                $(e.delegateTarget).sbutton('success');

                //刷新数据
                load();

                //为友好用户体验延迟关闭窗口
                setTimeout(function () {
                    viewPage.find('.edit_modal').modal('hide');
                }, 1000)

            }
        });


    }

    /**
     * 添加数据
     */
    $scope.createItem = function () {
        //清空表单,  避免显示历史输入数据
        viewPage.find('.edit_modal form')[0].reset();
        //显示编辑窗口
        viewPage.find('.edit_modal').modal('show');
    }


    /**
     * 查询数据
     * 例：?search=name-eq-1&search=text-eq-2
     * 注意视图HTML代码部分的写法命名规则等
     */
    $scope.searchItem = function () {
        //获取表单数据
        var search_obj = viewPage.find('form.search_form').inputs('get');

        var compiled = _.template("search=<%= key %>-<%= type %>-<%= value %>&");
        search = '?';

        //生成查询url
        _.each(search_obj, function (value, key) {
            search += compiled({value: value.value, key: key, type: value.type});
        });

        //去掉最后一个 & 字符
        search = search.slice(0, -1);

        load();

    }


    /**
     * 编辑数据
     */
    $scope.editItem = function (item) {
        //把编辑的数据设置到表单中
        viewPage.find('.edit_modal form').inputs('set', item);
        viewPage.find('.edit_modal').modal('show');
    }


    /**
     * 批量删除数据
     */
    $scope.deleteBatchItem = function () {
        BootstrapDialog.show({
            title: '系统提示',
            message: '确定删除吗？',
            buttons: [
                {
                    label: '确定删除',
                    cssClass: 'btn-primary',
                    action: function (d) {

                        //获取表格已选择数据行ID
                        var ids = viewPage.find('table').getCheckedIds();

                        //批量删除数据
                        demoTable.delete({data: ids}, function () {
                            alert('删除成功!');
                            d.close();
                            load();
                        });

                    }
                },
                {
                    label: '取消操作',
                    action: function (d) {
                        d.close();
                    }
                }
            ]
        });

    }


    /**
     * 删除数据
     */
    $scope.deleteItem = function (id) {
        BootstrapDialog.show({
            title: '系统提示',
            message: '确定删除吗？',
            buttons: [
                {
                    label: '确定删除',
                    cssClass: 'btn-primary',
                    action: function (d) {
                        demoTable.delete({str: id}, function () {
                            alert('删除成功!');
                            d.close();
                            load();
                        });
                    }
                },
                {
                    label: '取消操作',
                    action: function (d) {
                        d.close();
                    }
                }
            ]
        });
    }

    /**
     * 刷新数据
     */
    $scope.refreshItem = function () {
        search = '';
        sorting = {};
        load();
    }

    /**
     * 加载数据列表
     */
    function load(number) {
        //设置分页
        page.page = number || 1;

        demoTable.get({str: search, params: _.extend(page, sorting)}, function (result) {
            $scope.data = result.data;

            //设置分页插件
            if (result.metaData.totalPages != 0) {
                viewPage.find('.pagination').bootstrapPaginator(BPDefaultOptions(
                    {
                        currentPage: result.metaData.currentPage,
                        totalPages: result.metaData.totalPages,
                        onPageClicked: function (e, originalEvent, type, page) {
                            load(page);
                        }
                    }
                ));
            } else {
                viewPage.find('.pagination').html('<span class="label label-warning">暂无数据！</span>');
            }

        });

    }

    /**
     * 排序事件
     *
     * obj:{field:xxx, dir:desc/asc}  排序字段和排序方式
     */
    viewPage.find('table').on('sorting', function (e, obj) {
        sorting = {sort: obj.field};
        sorting[obj.field + '.dir'] = obj.dir;
        load(1);
    });


    //延迟加载实现友好的加载效果
    setTimeout(function () {
        load();
    }, 500);


});


app.controller('LoginCtrl', function ($scope) {

    window.scrollReveal = new scrollReveal();


    var e = '.loginpanel';

    $('#login-btn').click(function () {

        if ($(e + ' form').valid() && $("#username").val() == 'zlhl' && $("#password").val() == 'zlhl888') {
            doLogin();
        }

    });


    function doLogin() {
        localStorage.setItem('islogin', true);
        window.location.href = '../../../index.html';
    };


    $("#username").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#password").focus();
        }
    });
    $("#password").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#login-btn").click();
        }
    });

});

