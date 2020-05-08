<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"  @click="showAddCateDia">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格 -->
      <tree-table
        :data="cateList"
        show-index
        index-text="#"
        border
        :columns="columns"
        :expand-type="false"
        :selection-type="false">
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted == false"
            style="color: lightgreen;"/>
          <i class="el-icon-error" v-else style="color: red;"/>
        </template>
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template v-slot:opt>
          <el-button type="primary" class="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" class="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="jumper, prev, pager, next, total, sizes"
        :total="total"/>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"
      :visible.sync="addCateDiaVisible"
      width="50%"
      @close="addCateDiaClosed">
      <el-form :model="addCateForm"
        :rules="addCateDiaRules"
        ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"/>
        </el-form-item>
        <el-form-item label="父级分类: " prop="cat_name">
          <el-cascader
            :props="cascaderProps"
            v-model="selectedKeys"
            :options="parentCateList"
            @change="parentCateChanged"
            clearable/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDiaVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDiaVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateDiaRules: {
        cat_name: [
          { required: true, tirrger: 'blur', message: '请输入分类名称' }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    getCateList () {
      this.$http.get('categories', { params: this.queryInfo })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) { this.$message({ type: 'error', message: '获取分类列表失败' }) }
          this.cateList = res.data.result
          this.total = res.data.total
        })
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDia () {
      this.getParentCateList()
      this.addCateDiaVisible = true
    },
    getParentCateList () {
      this.$http.get('categories', { params: { type: 2 } })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取父级分类失败!' })
          this.parentCateList = res.data
        })
    },
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return
        this.$http.post('categories', this.addCateForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 201) return this.$message({ type: 'error', message: '添加分类失败!' })
            this.$message({ type: 'success', message: '添加分类成功!' })
            this.getCateList()
            this.addCateDiaVisible = false
          })
      })
    },
    addCateDiaClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_name = ''
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>

</style>
