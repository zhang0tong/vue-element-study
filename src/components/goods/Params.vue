<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert
        title="  ⚠️  警告信息"
        description="这个非常重要的警告信息,请仔细观看,只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"/>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <el-cascader
            :options="cateList"
            v-model="selectedKeys"
            :props="cateProps"
            @change="handleChange"
            clearable/>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDiaVisible = true">添加参数</el-button>
          <el-table :data="manyTabData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable @close="handleClose(i, scope.row)"
                  v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"/>
            <el-table-column label="参数名称" prop="attr_name"/>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDia(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性tab -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDiaVisible = true">添加属性</el-button>
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable  @close="handleClose(i, scope.row)"
                  v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"/>
            <el-table-column label="属性" prop="attr_name"/>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDia(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :visible.sync="addDiaVisible"
      :title="titleText"
      @close="addDiaClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDiaVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      :visible.sync="editDiaVisible"
      :title="'修改' + titleText"
      @close="editDiaClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDiaVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      activeName: 'many',
      manyTabData: [],
      onlyTabData: [],
      addDiaVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDiaVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    getCateList () {
      this.$http.get('categories')
        .then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取商品分类列表失败!' })
          this.cateList = res.data
        })
    },
    handleChange () {
      this.getParamsData()
    },
    handleTabsClick () {
      this.getParamsData()
    },
    getParamsData () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取参数列表失败!' })
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            item.inputVisible = false
            item.inputValue = ''
          })
          if (this.activeName === 'many') this.manyTabData = res.data
          else this.onlyTabData = res.data
        })
    },
    addDiaClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return
        this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }).then(({ data: res }) => {
          if (res.meta.status !== 201) return this.$message({ type: 'error', message: '添加' + this.titleText + '失败!' })
          this.$message({ type: 'success', message: '添加' + this.titleText + '成功' })
          this.getParamsData()
          this.addDiaVisible = false
        })
      })
    },
    showEditDia (attrId) {
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取信息失败' })
          this.editForm = res.data
          this.editDiaVisible = true
        })
    },
    editDiaClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        ).then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '修改参数失败' })
          this.$message({ type: 'success', message: '修该参数成功' })
          this.editDiaVisible = false
        })
      })
    },
    saveAttrVals (row) {
      this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }).then(({ data: res }) => {
        if (res.meta.status !== 200) return this.$message({ type: 'error', message: '修改内容失败' })
        this.$message({ type: 'success', message: '修改内容成功' })
      })
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length !== 0) {
        row.attr_vals.push(row.inputValue.trim())
        this.saveAttrVals(row)
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) return true
      else return false
    },
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  max-width: 100px;
}
</style>
