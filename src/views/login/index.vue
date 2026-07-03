<template>
  <div class="login-wrapper">
    <aside class="login-sidebar">
      <div class="login-logo">
        <span class="login-logo__mark">租</span>
        <div class="login-logo__text">
          <h1>汽车租赁管理系统</h1>
          <p>Auto Rental Admin</p>
        </div>
      </div>

      <div class="login-menu">
        <div class="login-menu__item is-active">
          <i class="el-icon-key" />
          <span>系统登录</span>
        </div>
        <div class="login-menu__item">
          <i class="el-icon-refresh" />
          <span>数据初始</span>
        </div>
        <div class="login-menu__item">
          <i class="el-icon-s-order" />
          <span>日常业务</span>
        </div>
        <div class="login-menu__item">
          <i class="el-icon-setting" />
          <span>权限管理</span>
        </div>
      </div>
    </aside>

    <main class="login-main">
      <header class="login-navbar">
        <div class="login-breadcrumb">
          <i class="el-icon-s-home" />
          <span>首页</span>
          <i class="el-icon-arrow-right" />
          <span>系统登录</span>
        </div>
        <div class="login-navbar__right">Auto Rental</div>
      </header>

      <section class="login-content">
        <div class="login-panel">
          <div class="login-panel__header">
            <span class="login-panel__tag">WELCOME BACK</span>
            <h2>账号登录</h2>
          </div>

          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            autocomplete="on"
            label-position="top"
          >
            <el-form-item prop="username" label="账号">
              <el-input
                ref="username"
                v-model="loginForm.username"
                prefix-icon="el-icon-user"
                placeholder="请输入账号"
                name="username"
                type="text"
                tabindex="1"
                autocomplete="on"
              />
            </el-form-item>

            <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
              <el-form-item prop="password" label="密码">
                <el-input
                  :key="passwordType"
                  ref="password"
                  v-model="loginForm.password"
                  prefix-icon="el-icon-lock"
                  :type="passwordType"
                  placeholder="请输入密码"
                  name="password"
                  tabindex="2"
                  autocomplete="on"
                  @keyup.native="checkCapslock"
                  @blur="capsTooltip = false"
                  @keyup.enter.native="handleLogin"
                >
                  <span slot="suffix" class="toggle-pwd" @click="showPwd">
                    <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                  </span>
                </el-input>
              </el-form-item>
            </el-tooltip>

            <el-button
              type="primary"
              :loading="loading"
              class="login-btn"
              @click.native.prevent="handleLogin"
            >
              登录
            </el-button>
          </el-form>
        </div>
      </section>
    </main>

    <el-dialog title="Or connect with" :visible.sync="showDialog">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br />
      <br />
      <br />
      <social-sign />
    </el-dialog>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  components: { SocialSign },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error('The password can not be less than 4 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: 'admin'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
              this.$message.error('账号或密码错误')
            })
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
.login-wrapper {
  .el-form-item {
    margin-bottom: 22px;
  }

  .el-form-item__label {
    padding-bottom: 6px;
    line-height: 20px;
    color: #606266;
    font-weight: 700;
  }

  .el-input__inner {
    height: 40px;
    line-height: 40px;
    border-radius: 4px;
  }

  .el-input__prefix,
  .el-input__suffix {
    line-height: 40px;
  }

  .el-form-item__error {
    padding-top: 4px;
  }
}
</style>

<style lang="scss" scoped>
$menuBg: #304156;
$menuHover: #263445;
$subMenuBg: #1f2d3d;
$menuText: #bfcbd9;
$activeBlue: #409eff;
$pageBg: #f0f2f5;
$textPrimary: #303133;
$textRegular: #606266;
$borderColor: #ebeef5;

.login-wrapper {
  display: flex;
  min-height: 100vh;
  background: $pageBg;
  color: $textPrimary;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}

.login-sidebar {
  width: 210px;
  min-height: 100vh;
  flex-shrink: 0;
  background: $menuBg;
  color: $menuText;
}

.login-logo {
  display: flex;
  align-items: center;
  height: 58px;
  padding: 0 18px;
  background: $subMenuBg;
  overflow: hidden;
}

.login-logo__mark {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-right: 10px;
  border-radius: 4px;
  background: $activeBlue;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 32px;
  text-align: center;
}

.login-logo__text {
  min-width: 0;

  h1 {
    margin: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    white-space: nowrap;
  }

  p {
    margin: 2px 0 0;
    color: rgba(191, 203, 217, 0.72);
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
  }
}

.login-menu {
  padding: 10px 0;
}

.login-menu__item {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  color: $menuText;
  font-size: 14px;

  i {
    width: 18px;
    margin-right: 16px;
    font-size: 16px;
  }

  &.is-active {
    color: $activeBlue;
    background: $menuHover;
  }
}

.login-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.login-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  flex-shrink: 0;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.login-breadcrumb {
  display: flex;
  align-items: center;
  color: #97a8be;
  font-size: 14px;

  i {
    margin-right: 8px;
  }

  span {
    margin-right: 8px;

    &:last-child {
      color: $textRegular;
      font-weight: 700;
    }
  }
}

.login-navbar__right {
  color: $textRegular;
  font-size: 14px;
}

.login-content {
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.login-panel {
  width: 400px;
  max-width: 100%;
  padding: 34px 34px 32px;
  background: #fff;
  border: 1px solid $borderColor;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.login-panel__header {
  margin-bottom: 28px;
  border-bottom: 1px solid $borderColor;
  padding-bottom: 18px;

  h2 {
    margin: 0;
    color: $textPrimary;
    font-size: 22px;
    font-weight: 700;
    line-height: 30px;
  }
}

.login-panel__tag {
  display: block;
  margin-bottom: 6px;
  color: $activeBlue;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.login-form {
  width: 100%;
}

.toggle-pwd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding-right: 4px;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
  user-select: none;

  &:hover {
    color: $activeBlue;
  }
}

.login-btn {
  width: 100%;
  height: 40px;
  margin-top: 4px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .login-wrapper {
    display: block;
  }

  .login-sidebar {
    width: 100%;
    min-height: auto;
  }

  .login-logo {
    height: 54px;
  }

  .login-menu {
    display: none;
  }

  .login-navbar {
    padding: 0 16px;
  }

  .login-navbar__right {
    display: none;
  }

  .login-content {
    padding: 20px 16px;
  }

  .login-panel {
    padding: 28px 22px 24px;
  }
}
</style>
