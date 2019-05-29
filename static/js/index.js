$(function () {
    $('#table_content').hide();
    var current_path = '';
   console.log($.fn.jquery);
   //此时的$是jquery1.4.4.js
   var setting = {
      async: {
          enable: true,
          type: 'get',
          url: '/v1/zookeeperPath/platform/'
      },
      view: {
          selectedMulti: false
      },
      edit: {
          enable: true,
          editNameSelectAll: true,
          showRemoveBtn: setRemoveBtn,
          showRenameBtn: setRenameBtn,
      },
      data: {
          simpleData: {
              enable: true
          }
      },
      callback: {
          //beforeExpand: beforeExpand,
          onAsyncSuccess: onAsyncSuccess,
          beforeRemove: zTreeBeforeRemove,
          beforeRename: zTreeBeforeRename,
          beforeClick: zTreeBeforeClick,
          //onAsyncError: onAsyncError
      }
   };

    /**
     * 设置移除按钮是否显示
     * @param treeId
     * @param treeNode
     * @returns {boolean}
     */
   function setRemoveBtn(treeId, treeNode) {
      return !treeNode.isParent;
   }

    /**
     * 设置重命名按钮是否显示
     * @param treeId
     * @param treeNode
     * @returns {boolean}
     */
   function setRenameBtn(treeId, treeNode) {
      return !treeNode.isParent;
   }

    /**
     * 当异步加载成功后的回调函数
     * @param event
     * @param treeId
     * @param treeNode
     * @param msg
     */
   function onAsyncSuccess(event, treeId, treeNode, msg) {

   }

    /**
     * 节点在将要删除之前的回调函数
     * @param treeId
     * @param treeNode
     * @returns {*}
     */
   function zTreeBeforeRemove(treeId, treeNode) {
       if (!confirm("确定要删除'" + treeNode.name + "'该节点?")){
           return false
       }
       var path = "";
       path = getNodePath(treeNode, path);
       console.log(path);
       var status = null;
       $.ajax({
           url: '/v1/zookeeperPath/'+path+'/',
           data: {},
           type: 'DELETE',
           success: function (result) {
                if (result.status === 1){
                    showAlert('success', '删除成功！');
                    status = true
                }else {
                    showAlert('danger', '删除失败！');
                    status = false
                }
            },
       });
       return status
   }

    /**
     * 设置节点重命名之前的回调函数
     * @param treeId
     * @param treeNode
     * @param newName
     * @param isCancel
     * @returns {*}
     */
   function zTreeBeforeRename(treeId, treeNode, newName, isCancel) {
       if (treeNode.name === newName){
           return true
       }
       var patt = /^[0-9a-zA-Z_]{1,}$/;
       if (!patt.test(newName)){
           showAlert('warning', '名称必须是数字，字母或下划线组成！');
           return false
       }
       if (!confirm("确定要将'" + treeNode.name + "'修改为'"+newName+"'?")){
           return false
       }
       var path = "";
       path = getNodePath(treeNode, path);
       console.log(path);
       var status = null;
       $.ajax({
           url: '/v1/zookeeperPath/'+path+'/',
           data: {newName: newName},
           type: 'PUT',
           success: function (result) {
                if (result.status === 1){
                    showAlert('success', '更新名称成功！');
                    status = false
                }else {
                    showAlert('danger', '更新名称失败！');
                    status = true
                }
            },
       });
       return status
   }

    /**
     * 树形结构的点击事件
     * @param treeId 节点id
     * @param treeNode 节点对象
     * @param clickFlag
     * @returns {boolean}
     */
   function zTreeBeforeClick(treeId, treeNode, clickFlag) {
       if (treeNode.level === 3) {
           var path = getNodePath(treeNode, "");
           current_path = path;
           var path_list = path.split(',');
           var html_str = "";
           for (var i in path_list) {
               if (i === path_list.length - 1) {
                   html_str += "<li class=\"breadcrumb-item active\" aria-current=\"page\">"+path_list[i]+"</li>";
               }else{
                   html_str += "<li class=\"breadcrumb-item\">"+path_list[i]+"</li>";
               }
           }
           // 更新面包屑
           $('#ol_breadcrumb').html(html_str);
           // 刷新表格中的数据
           reflashTable(path);
           $('#table_content').show();
           return true
       }
       $('#table_content').hide();
       return true
   }

    /**
     * 刷新配置表格
     * @param path
     */
    function reflashTable(path) {
        console.log(path.split(','));
        $.get('/v1/zookeeperValue/'+path+'/',function (result) {
           console.log(result);
           var content = '';
           for (var i = 0; i < result.length; i++) {
               var key = result[i].key;
               var value = result[i].value;
               content += '<tr>\n' +
                   '<th scope="row">'+(i+1)+'</th>\n' +
                   '    <td>'+key+'</td>\n' +
                   '    <td>'+value+'</td>\n' +
                   '    <td>\n' +
                   '        <button  key="'+key+'" val="'+value+'" type="button" class="btn btn-outline-primary btn-sm btn_edit_node" ' +
                   'data-toggle="modal" data-target=".bd-example-modal-lg"><span class="oi oi-pencil"></span></button>\n' +
                   '        <button  key="'+key+'" val="'+value+'" type="button" class="btn btn-outline-danger btn-sm btn_del_node"><span class="oi oi-x"></span></button>\n' +
                   '    </td>\n' +
                   '</tr>'
           }
           $('#tbody_config').html(content);
           setListener();
        });
    }

    /**
     * 设置操作按钮的监听事件
     */
   function setListener(){
       $('.btn_del_node').on('click', function (event) {
           var key = $(this).attr('key');
           var val = $(this).attr('val');
           if (!confirm("是否要继续删除'"+key+"="+val+"'该配置项？")){
               return
           }
           var path = current_path + ',' + key;
            $.ajax({
                url:"/v1/zookeeperValue/"+path+"/",
                data: {},
                type:"DELETE",
                success: function (result) {
                    if (result.status === 1){
                        showAlert('success', "删除配置项成功！");
                    } else {
                        showAlert('warning', "删除配置项失败！");
                    }
                }

            });
       });
       $('.btn_edit_node').on('click', function (event) {
           var key = $(this).attr('key');
           var val = $(this).attr('val');
           $('#input_update_key').attr('old-val', key);
           $('#input_update_value').attr('old-val', val);
       });
   }


    /**
     * 添加按钮的回调函数
     */
   $('#btn_node_add').on('click', function (event) {
       var nodeName = $('#input_node_name').val();
       if (nodeName.length === 0) {
           showAlert('warning', "输入不能为空！");
           return
       }
       var patt = /^[0-9a-zA-Z_]{1,}$/;
       if (!patt.test(nodeName)){
           showAlert('warning', '名称必须是数字，字母或下划线组成！');
           return
       }
       var treeObj = $.fn.zTree.getZTreeObj("myTree");
       var nodes = treeObj.getSelectedNodes();
       if (nodes.length === 0) {
           showAlert('warning', '请至少选择一个节点进行操作！');
           return
       }
       var znode = nodes[0];
       if (znode.level >= 3){
           showAlert('danger', '该节点等级为3，无法继续添加叶子节点！');
           return
       }
       var path = String("");
       console.log(path);
       path = getNodePath(znode, path);
       console.log(path);
       path = path + ',' + nodeName;
       $.post('/v1/zookeeperPath/'+path+'/',{},
           function (result) {
           console.log(result);
                if (result.status === 1){
                    treeObj.reAsyncChildNodes(null, "refresh");
                }
       })
   });

    /**
     * 递归获取当前节点的路径
     * @param node
     * @param path
     * @returns {*}
     */
   function getNodePath(node, path) {
       //console.log(node.name);
       if (path === ""){
           path = node.name;
       }else {
           path = node.name + ',' + path;
       }
       var p_node = node.getParentNode();
       if (p_node === null) {
           return path
       }
       return getNodePath(p_node, path)
   }

    /**
     * 显示信息的函数
     * @param level
     * @param msg
     */
   function showAlert(level, msg) {
       var divClass = "";
       switch (level) {
           case 'primary':
               divClass += 'alert alert-primary';
               break;
           case 'secondary':
               divClass += 'alert alert-secondary';
               break;
           case 'success':
               divClass += 'alert alert-success';
               break;
           case 'danger':
               divClass += 'alert alert-danger';
               break;
           case 'warning':
               divClass += 'alert alert-warning';
               break;
           case 'info':
               divClass += 'alert alert-info';
               break;
           case 'light':
               divClass += 'alert alert-light';
               break;
           case 'dark':
               divClass += 'alert alert-dark';
               break;
           default:
               divClass += 'alert alert-primary';
               break;
       }
       $('#div_show_alert').removeClass().attr('class', divClass);
       $('#div_show_alert').text(msg);
       $('#div_show_alert').show();
       setTimeout(function () {
           $('#div_show_alert').hide();
       }, 10000);
   }

    /**
     * 设置配置添加按钮的监听事件
     */
    $('#btn_add_path_value').on('click', function (event) {
       var key = $('#input_key').val();
       var value = $('#input_value').val();
       if (key.length === 0 || value.length === 0) {
           showAlert('danger', '输入不能为空！');
           return
       }
       var patt = /^[0-9a-zA-Z_]{1,}$/;
       if (!patt.test(key)){
           showAlert('warning', '名称必须是数字，字母或下划线组成！');
           return
       }
       $.post('/v1/zookeeperValue/'+current_path+'/',
           {
               'key': key,
               'value': value,
           },
           function (result) {
           if (result.status === 1) {
               console.log('添加配置成功！');
               $('#input_key').val("");
               $('#input_value').val("");
           }
           console.log(result)
       });
    });
    /**
     * 更新配置按钮的监听
     */
   $("#btn_update_path_value").on('click', function (event) {
        var oldKey = $('#input_update_key').attr('old-val');
        var oldVal = $('#input_update_value').attr('old-val');
        var newKey = $('#input_update_key').val();
        var newVal = $('#input_update_value').val();
        if (oldKey === newKey && oldVal === newVal) {
            return
        }
        $.ajax({
            url: "/v1/zookeeperValue/"+current_path+","+oldKey+"/",
            data:{
                key: newKey,
                value: newVal,
            },
            type: "PUT",
            success:function (result) {
                if (result.status === 1) {
                    // console.log("修改参数成功！");
                    showAlert('success', "修改参数成功！");
                    reflashTable(current_path)
                } else {
                    console.log("修改参数失败！");
                    showAlert('danger', "修改参数失败！");
                }
                $('#edit_model').modal('hide');
            }
        })
   });
    /**
     * 显示模态框的监听
     */
   $('#edit_model').on('show.bs.modal', function (event) {
        var key = $('#input_update_key').attr('old-val');
        var val = $('#input_update_value').attr('old-val');
        $('#input_update_key').val(key);
        $('#input_update_value').val(val);
   });
    /**
     * 隐藏模态框的监听
     */
   $('#edit_model').on('hide.bs.modal', function (event) {
        $('#input_update_key').attr('old-val', "");
        $('#input_update_value').attr('old-val', "");
   });
    /**
     * 初始化zTree组件
     */
   $(document).ready(function(){
      $.fn.zTree.init($("#myTree"), setting);
   });
});
