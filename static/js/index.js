$(function () {
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
       console.log(node.name);
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
     * 初始化zTree组件
     */
   $(document).ready(function(){
      $.fn.zTree.init($("#myTree"), setting);
   });
});



