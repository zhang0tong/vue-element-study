<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"/>
        <el-table-column label="订单编号" prop="order_id"/>
        <el-table-column label="订单价格" prop="order_price"/>
        <el-table-column label="是否付款">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货">
          <template v-slot="scope">
            <el-tag v-if="scope.row.is_send === '是'" type="success">已发货</el-tag>
            <el-tag v-else type="danger">未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间">
          <template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showbox"/>
            <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showProgressBox"/>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background/>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog
      title="修改地址"
      width="50%"
      :visible.sync="editDiaVisible"
      @close="addrDiaClosed">
      <el-form :model="addForm" :rules="addrFormRules" ref="addrFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            v-model="addForm.address1"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addForm.address2"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDiaVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDiaVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流进度 -->
    <el-dialog
      title="物流进度"
      width="50%"
      :visible.sync="progressDiaVisible"
      @close="addrDiaClosed">
      <el-timeline>
        <!-- <el-timeline-item v-for="(activity,  index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item> -->
        <el-timeline-item v-for="(activity,  index) in progressInfo" :key="index" :timestamp="activity.time" placement="top">
          <el-card>
            <h4>{{activity.ftime}}</h4>
            <p>{{activity.context}}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addForm: {
        address1: [],
        address2: ''
      },
      addrFormRules: {
        address1: [{ required: true, trigger: 'blur', message: '请选择城市' }],
        address2: [{ required: true, trigger: 'blur', message: '请填写详细地址' }]
      },
      cityData,
      editDiaVisible: false,
      progressDiaVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    getOrderList () {
      this.$http.get('orders', { params: this.queryInfo })
        .then(({ data: res }) => {
          if (res.meta.status !== 200) {
            return this.$message({ type: 'error', message: '获取订单列表失败!' })
          }
          this.orderList = res.data.goods
          this.total = res.data.total
        })
    },
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getOrderList()
    },
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrderList()
    },
    showbox () {
      this.editDiaVisible = true
    },
    addrDiaClosed () {
      this.$refs.addrFormRef.resetFields()
    },
    showProgressBox () {
      // this.$http.get('/kuaidi/1106975712662')
      //   .then(({ data: res }) => {
      //     if (res.meta.data !== 200) return this.$message({ type: 'error', message: '获取物流进度失败' })
      //     this.progressInfo = res.data
      //   })
      this.progressInfo = [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
      this.progressDiaVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
</style>
