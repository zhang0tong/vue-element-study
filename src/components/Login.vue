<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avator-box"><img src="../assets/logo.png" alt="logo" /></div>
      <el-form class="login-form" ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-icon-test8"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-icon-test7"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="default" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10个之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在6-16之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        var { data: result } = await this.$http.post('posttest01', this.loginForm)
        if (result.meta.status !== 200) return this.$message.error('登陆失败')
        window.sessionStorage.setItem('token', result.data.token)
        this.$router.push('/home')
      })
    },
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>
<style lang="less">
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avator-box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 5px #ddd;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
