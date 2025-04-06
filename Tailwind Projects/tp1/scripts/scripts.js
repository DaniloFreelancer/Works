// split прибирає /, і бере останній елемент через pop()
const currentPage = window.location.pathname.split("/").pop();
const allowedPages = ["index.html"];

// Перевіряємо, чи поточна сторінка є в масиві
// currentPage.includes - оскільки currentPage повернеться у вигляді string, просто перевіримо чи є така строка в масиві
if (allowedPages.some((page) => currentPage.includes(page))) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.documentElement.classList.add("loaded");
    }, 300);
  });
}

class DynamicAdapt {
  constructor(type) {
    this.type = type;
  }
  init() {
    // масив об'єктів
    this.оbjects = [];
    this.daClassname = "_dynamic_adapt_";
    // масив DOM-елементів
    this.nodes = [...document.querySelectorAll("[data-da]")];

    // наповнення оbjects об'єктами
    this.nodes.forEach((node) => {
      const data = node.dataset.da.trim();
      const dataArray = data.split(",");
      const оbject = {};
      оbject.element = node;
      оbject.parent = node.parentNode;
      оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
      оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
      оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
      оbject.index = this.indexInParent(оbject.parent, оbject.element);
      this.оbjects.push(оbject);
    });

    this.arraySort(this.оbjects);

    // масив унікальних медіа-запитів
    this.mediaQueries = this.оbjects
      .map(
        ({ breakpoint }) =>
          `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`
      )
      .filter((item, index, self) => self.indexOf(item) === index);

    // навішування слухача на медіа-запит
    // та виклик оброблювача при першому запуску
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];

      // масив об'єктів з відповідним брейкпоінтом
      const оbjectsFilter = this.оbjects.filter(
        ({ breakpoint }) => breakpoint === mediaBreakpoint
      );
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, оbjectsFilter);
      });
      this.mediaHandler(matchMedia, оbjectsFilter);
    });
  }
  // Основна функція
  mediaHandler(matchMedia, оbjects) {
    if (matchMedia.matches) {
      оbjects.forEach((оbject) => {
        // оbject.index = this.indexInParent(оbject.parent, оbject.element);
        this.moveTo(оbject.place, оbject.element, оbject.destination);
      });
    } else {
      оbjects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  // Функція переміщення
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    if (place === "last" || place >= destination.children.length) {
      destination.append(element);
      return;
    }
    if (place === "first") {
      destination.prepend(element);
      return;
    }
    destination.children[place].before(element);
  }
  // Функція повернення
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== undefined) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  // Функція отримання індексу всередині батьківського єлементу
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  // Функція сортування масиву по breakpoint та place
  // за зростанням для this.type = min
  // за спаданням для this.type = max
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
const da = new DynamicAdapt("max");
da.init();

let bodyLockStatus = true;

function bodyLockToggle(delay = 500) {
  if (document.documentElement.classList.contains("lock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
}

function bodyUnlock(delay = 500) {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");

    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("lock");
    }, delay);

    bodyLockStatus = false;
    setTimeout(() => {
      bodyLockStatus = true;
    }, delay);
  }
}

function bodyLock(delay = 500) {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    const lockPaddingValue =
      window.innerWidth - document.body.offsetWidth + "px";

    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });

    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.classList.add("lock");

    bodyLockStatus = false;
    setTimeout(() => {
      bodyLockStatus = true;
    }, delay);
  }
}

// Додаємо функції у глобальний об'єкт (наприклад, window), щоб їх можна було викликати у браузері
window.bodyLock = bodyLock;
window.bodyUnlock = bodyUnlock;
window.bodyLockToggle = bodyLockToggle;

document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("button");
  const menu = document.querySelector(".menu");
  menuButton.addEventListener("click", function (e) {
    if (bodyLockStatus && e.target.closest(".icon-menu")) {
      bodyLockToggle();
      menuButton.classList.toggle("menu-open");
      menu.classList.toggle("menu-open");
    }
  });
});

// const observer = new IntersectionObserver((entries) => {
//   entries.forEach((entry) => {
//     // show animation once
//       if (entry.isIntersecting) {
//         entry.target.classList.add("_watcher-view");
//       }
//   });
// });

// const watchElements = document.querySelectorAll("[data-watch]");
// watchElements.forEach((el) => observer.observe(el));

const flsModules = {}

function uniqArray(array) {
	return [...new Set(array)];
}


class ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: true,
		}
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.classList.contains('watcher') ? this.scrollWatcherRun() : null;
	}
	// Оновлюємо конструктор
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	// Запускаємо конструктор
	scrollWatcherRun() {
		document.documentElement.classList.add('watcher');
		this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
	}
	// Конструктор спостерігачів
	scrollWatcherConstructor(items) {
		if (items.length) {
			this.scrollWatcherLogging(`Прокинувся, стежу за об'єктами (${items.length})...`);
			// Унікалізуємо параметри
			let uniqParams = uniqArray(Array.from(items).map(function (item) {
				// Обчислення автоматичного Threshold
				if (item.dataset.watch === 'navigator' && !item.dataset.watchThreshold) {
					let valueOfThreshold;
					if (item.clientHeight > 2) {
						valueOfThreshold =
							window.innerHeight / 2 / (item.clientHeight - 1);
						if (valueOfThreshold > 1) {
							valueOfThreshold = 1;
						}
					} else {
						valueOfThreshold = 1;
					}
					item.setAttribute(
						'data-watch-threshold',
						valueOfThreshold.toFixed(2)
					);
				}
				return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
			}));
			// Отримуємо групи об'єктів з однаковими параметрами,
			// створюємо налаштування, ініціалізуємо спостерігач
			uniqParams.forEach(uniqParam => {
				let uniqParamArray = uniqParam.split('|');
				let paramsWatch = {
					root: uniqParamArray[0],
					margin: uniqParamArray[1],
					threshold: uniqParamArray[2]
				}
				let groupItems = Array.from(items).filter(function (item) {
					let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
					let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
					let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
					if (
						String(watchRoot) === paramsWatch.root &&
						String(watchMargin) === paramsWatch.margin &&
						String(watchThreshold) === paramsWatch.threshold
					) {
						return item;
					}
				});

				let configWatcher = this.getScrollWatcherConfig(paramsWatch);

				// Ініціалізація спостерігача зі своїми налаштуваннями
				this.scrollWatcherInit(groupItems, configWatcher);
			});
		} else {
			this.scrollWatcherLogging("Сплю, немає об'єктів для стеження. ZzzZZzz");
		}
	}
	// Функція створення налаштувань
	getScrollWatcherConfig(paramsWatch) {
		//Створюємо налаштування
		let configWatcher = {}
		// Батько, у якому ведеться спостереження
		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root);
		} else if (paramsWatch.root !== 'null') {
			this.scrollWatcherLogging(`Эмм... батьківського об'єкта ${paramsWatch.root} немає на сторінці`);
		}
		// Відступ спрацьовування
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
			this.scrollWatcherLogging(`йой, налаштування data-watch-margin потрібно задавати в PX або %`);
			return
		}
		// Точки спрацьовування
		if (paramsWatch.threshold === 'prx') {
			// Режим паралаксу
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i);
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',');
		}
		configWatcher.threshold = paramsWatch.threshold;

		return configWatcher;
	}
	// Функція створення нового спостерігача зі своїми налаштуваннями
	scrollWatcherCreate(configWatcher) {
		console.log(configWatcher);
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	// Функція ініціалізації спостерігача зі своїми налаштуваннями
	scrollWatcherInit(items, configWatcher) {
		// Створення нового спостерігача зі своїми налаштуваннями
		this.scrollWatcherCreate(configWatcher);
		// Передача спостерігачеві елементів
		items.forEach(item => this.observer.observe(item));
	}
	// Функція обробки базових дій точок спрацьовування
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			// Бачимо об'єкт
			// Додаємо клас
			!targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
			this.scrollWatcherLogging(`Я бачу ${targetElement.classList}, додав клас _watcher-view`);
		} else {
			// Не бачимо об'єкт
			// Забираємо клас
			targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
			this.scrollWatcherLogging(`Я не бачу ${targetElement.classList}, прибрав клас _watcher-view`);
		}
	}
	// Функція відключення стеження за об'єктом
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
		this.scrollWatcherLogging(`Я перестав стежити за ${targetElement.classList}`);
	}
	// Функція виведення в консоль
	scrollWatcherLogging(message) {
		this.config.logging ? console.log(`[Спостерігач]: ${message}`) : null;
	}
	// Функція обробки спостереження
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		// Обробка базових дій точок спрацьовування
		this.scrollWatcherIntersecting(entry, targetElement);
		// Якщо є атрибут data-watch-once прибираємо стеження
		targetElement.hasAttribute('data-watch-once') && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
		// Створюємо свою подію зворотного зв'язку
		document.dispatchEvent(new CustomEvent("watcherCallback", {
			detail: {
				entry: entry
			}
		}));

		/*
		// Вибираємо потрібні об'єкти
		if (targetElement.dataset.watch === 'some value') {
			// пишемо унікальну специфіку
		}
		if (entry.isIntersecting) {
			//Бачимо об'єкт
		} else {
			//Не бачимо об'єкт
		}
		*/
	}
}
// Запускаємо та додаємо в об'єкт модулів
flsModules.watcher = new ScrollWatcher({});

// Робота з шапкою при скролі
function headerScroll() {
	addWindowScrollEvent = true;
	const header = document.querySelector('header.header');
	const headerShow = header.hasAttribute('data-scroll-show');
	const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
	const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("windowScroll", function (e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains('_header-scroll') ? header.classList.add('_header-scroll') : null;
			if (headerShow) {
				if (scrollTop > scrollDirection) {
					// downscroll code
					header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
				} else {
					// upscroll code
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}
				timer = setTimeout(() => {
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}, headerShowTimer);
			}
		} else {
			header.classList.contains('_header-scroll') ? header.classList.remove('_header-scroll') : null;
			if (headerShow) {
				header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
			}
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
setTimeout(() => {
	if (addWindowScrollEvent) {
		let windowScroll = new Event("windowScroll");
		window.addEventListener("scroll", function (e) {
			document.dispatchEvent(windowScroll);
		});
	}
}, 0);
headerScroll()