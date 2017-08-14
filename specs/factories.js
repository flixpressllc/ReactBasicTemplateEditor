const factories = {
  caption: () => {
    return {
      label: `Fake Caption ${getNewId()}`,
      settings: {},
      value: ''
    };
  }
};

let incrementor;

export function resetFactories() {
  incrementor = 1;
}

resetFactories();

function getNewId () {
  return incrementor++;
}

function getFactory (factory) {
  return factories[factory]();
}

export function create (factory, ...overrides) {
  let obj = getFactory(factory);
  overrides = overrides || {};
  return Object.assign({}, obj, ...overrides);
}

export default create;


/*
const referenceFactories = {
  template: () => {
    return {
      id: getNewId(),
      tags: [],
      name: 'Sparky Pro Electrocutionator',
      type: 'Default',
      image: 'some/image.jpg',
      duration: '0:23',
      plan: 'Free',
      orderQueryParam: 'oFNVOgIuFqNnovz03dBSeZQNUTgZIJ1nKiz1vpN209g=',
      previewVideoUrl: 'http://files.flixcore.com/videos/1.mp4',
      price: 'subscription'
    };
  },
  templateGroup: () => {
    return create('template', {
      name: 'Some Great Group Name',
      children: []
    });
  },
  previewProps: () => {
    return {
      image: 'some/image.jpg',
      video: 'some/video.mp4'
      // active: false
    }
  },
  templateHeader: () => {
    return {
      name: 'Some Great Name',
      templateId: 1,
      userType: 'Free'
      // isHovered: false,
      // isDisabled: false,
      // isTrial: false,
      // isGroup: false
    }
  },
  templateFooter: () => {
    return {
      template: create('template'),
      costType: 'plan',
      onUpgradeHover: () => {},
      onUpgradeUnhover: () => {},
      userType: 'Free',
      // isHovered: false,
      duration: '0:30',
      plan: 'Free',
      price: '$0'
    }
  },
  incomingTemplateData: () => {
    return {
      templateId: 1,
      templatePortalId: 0,
      name: 'The Premiere Template',
      runningTimeText: '0:17',
      previewVideoUrl: 'https://mediarobotvideo.s3.amazonaws.com/sm/Template01.mp4',
      categories: [
        'food',
        'entertainment',
        'grotesque'
      ],
      thumbnailUrl: 'https://flixpress.com/tempImages/1.jpg',
      editingUserInterfaceName: 'EditingPageBackendTest',
      orderCipherTextForCreate: 'oFNVOgIuFqNnovz03dBSeZQNUTgZIJ1nKiz1vpN209g='
    };
  },
  'dataAdapter': () => {
    return {
      templatesData: [create('incomingTemplateData')],
      userType: 'Free',
      userName: 'Jonny@zombie.prom'
    }
  }
};
*/
