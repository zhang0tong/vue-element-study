<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"/>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"/>
        <el-step title="商品参数"/>
        <el-step title="商品属性"/>
        <el-step title="商品图片"/>
        <el-step title="商品内容"/>
        <el-step title="完成"/>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top">
        <!-- tab栏区域 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'"
          :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"/>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"/>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"/>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" >
              <el-input v-model="addForm.goods_number" type="number"/>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cateProps"
                v-model="selectedKeys"
                @change="handleChange"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border/>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              @on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"/>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible">
      <img :src="previewPath" class="previewImg"/>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品信息', triggere: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', triggere: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', triggere: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', triggere: 'blur' }]
      },
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedKeys: [],
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    getCateList () {
      this.$http.get('categories')
        .then(({ data: res }) => {
          if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取商品分类信息失败' })
          this.cateList = res.data
        })
    },
    handleChange () {
      if (this.selectedKeys.length !== 3) this.selectedKeys = []
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.selectedKeys.length !== 3) {
        this.$message({ type: 'error', message: '请先选择商品分类' })
        return false
      }
    },
    tabClicked () {
      if (this.selectedKeys.length !== 3) return
      if (this.activeIndex === '1' && this.manyTableData.length === 0) {
        this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          .then(({ data: res }) => {
            if (res.meta.status !== 200) {
              return this.$message({ type: 'error', message: '获取动态参数列表失败' })
            }
            res.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            })
            this.manyTableData = res.data
          })
      }
      if (this.activeIndex === '2' && this.onlyTableData.length === 0) {
        this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          .then(({ data: res }) => {
            if (res.meta.status !== 200) {
              return this.$message({ type: 'error', message: '获取静态属性列表失败' })
            }
            this.onlyTableData = res.data
          })
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
      const filepath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item => item.pic === filepath)
      this.addForm.pics.splice(i, 1)
    },
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    add () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message({ type: 'error', message: '请填写必要的表单项' })
        }
        this.addForm.goods_cat = this.selectedKeys.join(',')
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        console.log(this.addForm)
        this.$http.post('goods', this.addForm)
          .then(({ data: res }) => {
            if (res.meta.status !== 201) return this.$message({ type: 'error', message: '添加商品失败!' })
            this.$message({ type: 'success', message: '添加商品成功!' })
            this.$router.push('/goods')
          })
      })
    }
  },
  computed: {
    cateId () {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
  height: 100%;
}
.ql-editor {
  min-height: 300px;
}
.el-button {
  margin-top: 10px;
}
</style>
