import webdriver from 'selenium-webdriver';
import shortid from 'shortid';
const fs = require('fs');
import Twit from 'twit';

const Bot = new Twit({
 consumer_key: process.env.BOT_CONSUMER_KEY,
 consumer_secret: process.env.BOT_CONSUMER_SECRET,
 access_token: process.env.BOT_ACCESS_TOKEN,
 access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
});

const driver = new webdriver.Builder().forBrowser('chrome').build();

const getRandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

const getRandomCoordinates = () => {
  return {
    x: getRandomNumber(100, 450),
    y: getRandomNumber(100, 450)
  };
}

function writeScreenshot(data, name) {
  name = name || 'screenshot.png';
  var screenshotPath = './screenshots/';
  fs.writeFileSync(screenshotPath + name, data, 'base64');
};

driver.manage().window().setSize(600, 715);

// ask the browser to open a page
driver.navigate()
  .to('http://spheres.cool/?is_automated=true').then(() => {
    driver
      .executeScript(`
        window.localStorage.setItem('spheres.isUserFullyOnboarded', 'true');
        window.localStorage.setItem('spheres.isUserAfterFirstSphereMove', 'true');
      `);

    return driver.navigate()
      .refresh().then(() => {
        const content = driver.findElement({ id: 'content' });
        const menuIcon = driver.findElement({ id: 'open-menu-icon' });

        return driver.actions()
          .mouseMove(menuIcon)
          .click()
          .perform().then(() => {
            const randomiseMenuItem = driver.findElement({ id: 'randomise-menu-item' });

            return driver.actions()
              .mouseMove(randomiseMenuItem)
              .click()
              .perform().then(() => {
                const closeMenuIcon = driver.findElement({ id: 'close-menu-icon' });

                return driver.actions()
                  .mouseMove(closeMenuIcon)
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content, getRandomCoordinates())
                  .click()
                  .mouseMove(content)
                  .perform().then(() => {
                    return driver
                      .executeScript(`
                        document.querySelector('.icons').remove();
                      `).then(() => {
                        return driver.takeScreenshot().then((data) => {
                          // writeScreenshot(data, `${ shortid.generate() }.png`);

                          Bot.post('media/upload', { media_data: data }, (err, data, res) => {
                            Bot.post('media/metadata/create', {
                              media_id: data.media_id_string,
                              alt_text: { text: 'A colourful composition of spheres' },
                            }, (err) => {
                              if (!err) {
                                Bot.post('statuses/update', {
                                  status: '',
                                  media_ids: [data.media_id_string]
                                });
                              }
                            });
                          });

                          return driver.quit();
                        })
                      });
                  });
              });
          });
      });
  });
