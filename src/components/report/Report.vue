<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 600px; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {

  },
  mounted () {
    const myChart = echarts.init(document.getElementById('main'))
    this.$http.get('reports/type/1')
      .then(({ data: res }) => {
        if (res.meta.status !== 200) return this.$message({ type: 'error', message: '获取折线图数据失败!' })
        // const result = Object.assign(this.options, res.data)
        const result = { ...this.options, ...res.data }
        myChart.setOption(result)
      })
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
</style>
