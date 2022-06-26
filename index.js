"use strict";
const root = document.querySelector('.cards');

const mapSocialClass = new Map();
mapSocialClass.set('www.facebook.com', 'fa-facebook-square');
mapSocialClass.set('twitter.com', 'fa-twitter-square');
mapSocialClass.set('www.instagram.com', 'fa-instagram-square');

const arrSelectedActors = [];

fetch("./data.json")
  .then((response) => response.json())
  .then((users) => {
    const cards = users
      .filter(({ firstName, lastName }) => firstName && lastName)
      .map((user) => createCard(user));
    root.append(...cards);
  })
  .catch((error) => {
    const cardsSections = document.querySelector('section.cards-section');
    cardsSections.style.visibility = 'hidden';
    alert('No data, server error. Try later')
  })


function createElement(tag = 'div', { classes = [], attributes = {}, events = {}, datasets = {}, styles = {} }, ...children) {
  const element = document.createElement(tag);
  if (classes.length) {
    element.classList.add(...classes);
  }
  for (const [nameAttr, valueAttr] of Object.entries(attributes)) {
    element.setAttribute(nameAttr, valueAttr);
  }
  for (const [typeEvent, handlerEvent] of Object.entries(events)) {
    element.addEventListener(typeEvent, handlerEvent);
  }
  for (const [name, value] of Object.entries(datasets)) {
    element.dataset[name] = value;
  }
  for (const [name, value] of Object.entries(styles)) {
    element.style[name] = value;
  }
  element.append(...children);
  return element;
}

function createCard(user) {
  const cardInitials = createElement(
    'div',
    {
      classes: ['card-initials'],
      styles: { backgroundColor: stringToColour(getFullName(user)) }
    },
    document.createTextNode(createNameAbbreviation(user)));

  const cardPhoto = createElement(//из-за асинхронности можно не передавать в photoWrapper
    'img',
    {
      classes: ['card-photo'],
      attributes: { src: user.profilePicture, alt: getFullName(user) },
      datasets: { id: `wrapper-${user.id}` },
      events: { error: photoErrorHandler, load: photoLoadHandler }
    }
  );

  const photoWrapper = createElement(
    'div',
    {
      classes: ['card-photo-wrapper'],
      attributes: { id: `wrapper-${user.id}` }
    },
    cardInitials
  );

  const fullName = createElement(
    'h2',
    {
      classes: ['full-name']
    },
    document.createTextNode(getFullName(user))
  );

  const socialItems = user.contacts.map(ref => {
    const url = new URL(ref);
    const social = createElement(
      'a',
      {
        classes: ['social', 'fa-brands', mapSocialClass.get(url.hostname)],
        attributes: { href: ref, target: '_blank' }
      }
    )
    const socialItem = createElement(
      'li',
      {
        classes: ['social-item']
      },
      social
    )

    return socialItem;
  });

  const socials = createElement(
    'ul',
    {
      classes: ['socials']
    },
    ...socialItems
  )

  const card = createElement(
    'article',
    {
      classes: ['card'],
      events: { click: selectActorHandler },
      datasets: { fullName: getFullName(user) }

    },
    photoWrapper, fullName, socials
  );

  const cardItem = createElement(
    'li',
    {
      classes: ['card-item']
    },
    card
  );

  return cardItem;
}

function selectActorHandler({ target }) {
  const parent = target.closest('.card');
  const { fullName } = parent.dataset;
  const listSelectedActors = document.getElementById('list-selected-actors');
  const selectedActor = createElement(
    'li',
    {
      classes: ['selected-actor'],
      events: { dblclick: selectedActorHandler },
      datasets: { fullName: fullName }
    },
    document.createTextNode(fullName)
  )
  if (!arrSelectedActors.includes(fullName) && target.tagName !== 'A') {
    arrSelectedActors.push(fullName);
    listSelectedActors.append(selectedActor);
  }
}

function selectedActorHandler({ target, target: { dataset: { fullName } } }) {
  target.remove();
  arrSelectedActors.splice(arrSelectedActors.indexOf(fullName), 1)
}

function photoErrorHandler({ target }) {
  target.remove();
}

function photoLoadHandler({ target }) {
  const parent = document.getElementById(target.dataset.id);
  parent.append(target);
}

function stringToColour(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).slice(-2);
  }
  return colour;
}

function createNameAbbreviation(user) {
  return user.firstName[0] + user.lastName[0];
}

function getFullName(user) {
  return user.firstName + ' ' + user.lastName;
}

