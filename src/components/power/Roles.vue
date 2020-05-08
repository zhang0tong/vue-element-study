<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 权限列表扩展行 -->
        <el-table-column type="expand">
          <template v-slot="props">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in props.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(props.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"/>
              </el-col>
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(props.row, item2.id)"
                      type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"/>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(props.row, item3.id)"
                      v-for="(item3) in item2.children" :key="item3.id"
                      type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"/>
        <el-table-column label="角色名称" prop="roleName"/>
        <el-table-column label="角色描述" prop="roleDesc"/>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="warning" size="mini" icon="el-icon-delete">删除</el-button>
            <el-button type="danger" size="mini" icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      @close="rightDialogClosed"
      width="30%">
      <el-tree
        ref="treeRef"
        :data="rightsTree"
        node-key="id"
        check-on-click-node
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
        :props="treeProp">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleId: '',
      rolesList: [],
      rightDialogVisible: false,
      rightsTree: [],
      treeProp: {
        label: 'authName',
        children: 'children'
      },
      defKeys: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败!')
      this.rolesList = res.data
    },
    removeRightById (role, rightId) {
      this.$confirm('此操作将会永久移除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        this.$message.error('删除权限成功')
        role.children = res.data
      }).catch(() => {
        this.$message.info('取消了删除')
      })
    },
    async showSetRightDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取权限树失败' })
      this.rightsTree = res.data
      this.roleId = role.id
      this.getLeafKeys(role, this.defKeys)
      this.rightDialogVisible = true
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    rightDialogClosed () {
      this.defKeys = []
      this.rightDialogVisible = false
    },
    async setRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message({ type: 'error', message: '分配权限失败' })
      this.$message({ type: 'success', message: '分配权限成功' })
      this.getRolesList()
      this.rightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
