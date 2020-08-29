import { Selector } from 'testcafe';

fixture('Fler.cz').page('https://www.fler.cz/uzivatel/prihlaseni');

test('Make top', async (t): Promise<number> => {
  console.info('Logging in');
  await t
    .wait(2000)
    .typeText('#ti-username', process.env.USERNAME)
    .typeText('#ti-pwd', process.env.PASSWORD)
    .click('button[name="btnLogin"]')
    .wait(2000);
  console.info('Entering goods list');
  await t
    .wait(2000)
    .hover('.hoverable > a.rootmenu.first')
    .wait(2000)
    .click('a[href="/moje-zbozi2"]')
    .wait(2000);

  const randomGoodsPage = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const pageButtonElements = document.querySelectorAll('#panel-bottom .numerics > a');
    const index = getRandomInt(0, pageButtonElements.length);
    if (index === pageButtonElements.length) {
      return [];
    }
    return [pageButtonElements[index]];
  });
  console.info('Entering random goods page');
  await t.click(randomGoodsPage).wait(2000);

  const randomGoodsItem = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const editButtonElements = document.querySelectorAll(
      '.product .cartbuttons [fler-action="open_edit_panel"]'
    );
    if (editButtonElements.length === 0) {
      return [];
    }
    const index = getRandomInt(0, editButtonElements.length - 1);
    return [editButtonElements[index]];
  });
  console.info('Selecting random goods item');
  await t
    .click(randomGoodsItem)
    .wait(2000)
    .click('.flypanel.visible .buttonmenu [data-editblock-load="topproduct"]')
    .wait(2000);

  const topButton = Selector((): Node[] => {
    const topButtons = document.querySelectorAll('.flypanel.visible .edit_block_form button');
    if (topButtons.length === 0) {
      return [];
    }
    return [topButtons[0]];
  });
  console.info('Trying to top');
  const canBeTopped = await topButton.exists;
  if (canBeTopped) {
    console.info('Topping');
    await t.click(topButton).wait(2000);
    console.info('Topped');
    return 0;
  }
  console.info('Missing top button');
  console.info('Parsing waiting time');
  const topTimer = Selector('.flypanel.visible .info.message span');
  const topTimerText = await topTimer.getAttribute('title');
  const matches = topTimerText.match(/(\d{2}:\d{2}:\d{2})/g);
  const timeSegments = matches[0].split(':');
  const seconds =
    (Number(timeSegments[0]) * 60 + Number(timeSegments[1])) * 60 + Number(timeSegments[2]);
  console.log('It is topped', {
    nextTop: timeSegments,
    nextTopSeconds: seconds
  });
  return seconds;
});
