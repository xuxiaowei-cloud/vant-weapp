// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/home1/index",
      iconPath: "/image/icon_component.png",
      selectedIconPath: "/image/icon_component_HL.png",
      text: "组件"
    }, {
      pagePath: "/pages/home2/index",
      iconPath: "/image/icon_API.png",
      selectedIconPath: "/image/icon_API_HL.png",
      text: "接口"
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
      this.setData({
        selected: data.index
      })
    }
  }
})