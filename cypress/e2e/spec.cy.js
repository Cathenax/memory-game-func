/// <reference types="cypress" />

describe('Visit Test', () => {
  beforeEach(() => {
    // root-level hook
    // runs before every test
    cy.visit('https://cathenax.github.io/memory-game-func/')
  });

  it('Card can be clicked and flipped', () => {
    // click on a card
    cy.get('.container[id=0]').click();
    cy.get('.container[id=0]').should('have.class', 'flipped');
  });

  it('Can start a new Game', () => {
    // click on the New Game button
    cy.get('#root > div > div.gameheader > button:nth-child(1)').click();
    // Move is reset
    cy.get('#root > div > div.gamefooter > span:nth-child(1)').should('have.text','Total Moves: 0');
  });
  
  it('Can stop the Game', () => {
    // click on the Stop button
    cy.get('#root > div > div.gameheader > button:nth-child(2)').click();
    cy.get('#root > div > div.gameheader > button:nth-child(2) > span').should('have.text','Resume');
  });

  it('Can show the Difficulty Modal', () => {
    // click on the Settings button
    cy.get('#root > div > div.gameheader > button:nth-child(4)').click();
    cy.get('body > div:nth-child(2) > div > div.ant-modal-wrap > div').should('be.visible');
  });

  it('Can match two cards', () => {
    // click on the Settings button
    cy.get('.container[data-id=1]').click({multiple:true});
    cy.get('.container[data-id=1]').should('be.disabled');
  });

});

