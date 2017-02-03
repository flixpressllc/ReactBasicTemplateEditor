export default {
  ui: [
    {
      'Customize Icon': [
        {
          type: 'DropDown',
          name: 'Icon Style',
          value: 'camera'
        },
        {
          type: 'TextField',
          name: 'Icon Character - type in only one (optional)',
          value: 'q'
        }
      ]
    },
    {
      'Customize Look': [
        {
          type: 'DropDown',
          name: 'Background',
          value: 'camo'
        },
        {
          type: 'DropDown',
          name: 'Icon Color',
          value: 'icon_pink'
        },
        {
          type: 'DropDown',
          name: 'Main Text Color',
          value: 'main_orange'
        },
        {
          type: 'DropDown',
          name: 'Subtitle Text Color',
          value: 'sub_white'
        }
      ]
    },
    {
      'Customize Text': [
        {
          type: 'TextField',
          name: 'Text Left of Icon',
          value: 'Left'
        },
        {
          type: 'TextField',
          name: 'Text Right of Icon',
          value: 'Right'
        },
        {
          type: 'TextField',
          name: 'Subtitle',
          value: 'Bottom'
        }
      ]
    }
  ],
  isPreview: true,
  audioInfo: {
    audioType: 'StockAudio',
    audioUrl: 'https://fpsound.s3.amazonaws.com/13.mp3',
    id: 13,
    length: 0,
    name: 'Bunny Garden'
  },
  resolutionId: 3,
  resolutionOptions: [
    { 'id': 5, 'name': '720p' },
    { 'id': 3, 'name': '1080p' },
  ]
}