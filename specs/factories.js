const factories = {
  caption: () => {
    return {
      label: `Fake Caption ${getNewId('cap')}`,
      settings: {},
      value: ''
    };
  },
  image: () => {
    return {
      file: `filename${getNewId('img')}.jpg`
      // dropDowns: []
      // captions: []
    }
  },
  imageContainerProps: () => {
    return {
      fieldName: `myImageContainer${getNewId('imgCon')}`
      // images: []
      // imageBank: []
    }
  },
  dropDown: () => {
    return {
      label: `Drop Down List ${getNewId('dd')}`,
      options: create_list('dropDownOption', 4),
      value: '1'
    }
  },
  dropDownOption: () => {
    const names = ['Toffee', 'Jonny', 'Candy', 'Jake', 'Ginger', 'Josh', 'Coco', 'Joey'];
    let currentInc = getNewId('ddo' + getIdFor('dd'));
    let name = names[(currentInc - 1) % 6] + (Math.floor(currentInc/6) + currentInc % 6)
    return {name, value: currentInc};
  }
};

class IncrementorStore {
  constructor() {
    this.generalInc = 0;
    this.store = {};
  }

  _incrementGeneral() {
    return ++this.generalInc
  }

  _confirmId(idString) {
    if (!this.store[idString]) {
      this.store[idString] = 0;
    }
  }

  _incrementId(idString) {
    this._confirmId(idString);
    return ++this.store[idString];
  }

  increment(optionalIdString) {
    if (optionalIdString) {
      return this._incrementId(optionalIdString.toString());
    } else {
      return this._incrementGeneral();
    }
  }

  _getCurrentId(idString) {
    this._confirmId(idString)
    return this.store[idString];
  }

  getCurrentValue(optionalIdString) {
    if (optionalIdString) {
      return this._getCurrentId(optionalIdString.toString());
    } else {
      return this.generalInc;
    }
  }
}

let incrementor = new IncrementorStore();

export function resetFactories() {
  incrementor = new IncrementorStore();
}

resetFactories();

function getNewId (optionalId) {
  return incrementor.increment(optionalId);
}

function getIdFor (optionalId) {
  return incrementor.getCurrentValue(optionalId);
}

function getFactory (factory) {
  if (factories[factory] === undefined) {
    throw new Error(`Factory "${factory}" is not recognized.`);
  }
  return factories[factory]();
}

export function create (factory, ...overrides) {
  let obj = getFactory(factory);
  overrides = overrides || {};
  return Object.assign({}, obj, ...overrides);
}

export function create_list (factory, count, ...overrides) {
  return new Array(count).fill(null).map(() => create(factory, ...overrides));
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
