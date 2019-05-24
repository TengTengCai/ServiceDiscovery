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
   function setRemoveBtn(treeId, treeNode) {
      return !treeNode.isParent;
   }
   function setRenameBtn(treeId, treeNode) {
      return !treeNode.isParent;
   }

   function onAsyncSuccess(event, treeId, treeNode, msg) {

   }
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

   var zNodes =[
         { id:1, pId:0, name:"父节点1 - 展开", open:true},
         { id:11, pId:1, name:"父节点11 - 折叠"},
         { id:111, pId:11, name:"叶子节点111"},
         { id:112, pId:11, name:"叶子节点112"},
         { id:113, pId:11, name:"叶子节点113"},
         { id:114, pId:11, name:"叶子节点114"},
         { id:12, pId:1, name:"父节点12 - 折叠"},
         { id:121, pId:12, name:"叶子节点121"},
         { id:122, pId:12, name:"叶子节点122"},
         { id:123, pId:12, name:"叶子节点123"},
         { id:124, pId:12, name:"叶子节点124"},
         { id:13, pId:1, name:"父节点13 - 没有子节点", isParent:true},
         { id:2, pId:0, name:"父节点2 - 折叠"},
         { id:21, pId:2, name:"父节点21 - 展开", open:true},
         { id:211, pId:21, name:"叶子节点211"},
         { id:212, pId:21, name:"叶子节点212"},
         { id:213, pId:21, name:"叶子节点213"},
         { id:214, pId:21, name:"叶子节点214"},
         { id:22, pId:2, name:"父节点22 - 折叠"},
         { id:221, pId:22, name:"叶子节点221"},
         { id:222, pId:22, name:"叶子节点222"},
         { id:223, pId:22, name:"叶子节点223"},
         { id:224, pId:22, name:"叶子节点224"},
         { id:23, pId:2, name:"父节点23 - 折叠"},
         { id:231, pId:23, name:"叶子节点231"},
         { id:232, pId:23, name:"叶子节点232"},
         { id:233, pId:23, name:"叶子节点233"},
         { id:234, pId:23, name:"叶子节点234"},
         { id:3, pId:0, name:"父节点3 - 没有子节点", isParent:true}
         ];

   $(document).ready(function(){
      $.fn.zTree.init($("#myTree"), setting);
   });
});



