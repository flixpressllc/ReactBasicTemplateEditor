export default {
  ui: [
    {
      'Customize Text': [
        {
          type: 'TextField',
          name: 'Text Left of Icon',
          value: 'Text for left'
        },
        {
          type: 'TextField',
          name: 'Text Right of Icon',
          value: 'Text for right'
        }
      ]
    },
    {
      'Image Container': [
        {
          type: 'UserImageChooser',
          name: 'Your Two Images',
          value: [
            {
              file: 'DonDentonAdmin_1-23-2017_15345872.jpg',
              captions: [
                {label: 'Top Text', value:'', settings:{}},
                {label: 'Middle Text', value:'MT 1', settings:{}},
                {label: 'Bottom Text', value:'', settings:{}}
              ],
              dropDowns: [
                {label: 'Which Kid?', value:'toffee'}
              ]
            },
            {
              file: 'DonDentonAdmin_1-23-2017_145944747.jpg',
              captions: [
                {label: 'Top Text', value:'', settings:{}},
                {label: 'Middle Text', value:'', settings:{}},
                {label: 'Bottom Text', value:'BT 2', settings:{}}
              ],
              dropDowns: [
                {label: 'Which Kid?', value:'jonny'}
              ]
            },
            {
              file: 'DonDentonAdmin_tree.jpg',
              captions: [
                {label: 'Top Text', value:'TT 3', settings:{}},
                {label: 'Middle Text', value:'', settings:{}},
                {label: 'Bottom Text', value:'', settings:{}}
              ],
              dropDowns: [
                {label: 'Which Kid?', value:'toffee'}
              ]
            }
          ]
        }
      ]
    }
  ],
  isPreview: true,
  audioInfo: {
    audioType: 'StockAudio',
    audioUrl: 'https://fpsound.s3.amazonaws.com/2.mp3',
    id: 2,
    length: 2,
    name: 'Anitra'
  },
  resolutionId: 3,
  resolutionOptions: [
    { id: 3, name: '1080p' },
    { id: 4, name: '4K' }
  ],
  imageBank: [
    'DonDentonAdmin_1-23-2017_15345872.jpg',
    'DonDentonAdmin_1-23-2017_145944747.jpg',
    'DonDentonAdmin_paper.jpg',
    'DonDentonAdmin_money.jpg',
    'DonDentonAdmin_hammer.jpg',
    'DonDentonAdmin_tree.jpg'
  ]
}
