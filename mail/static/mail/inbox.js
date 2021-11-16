document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // enable send button on compose view and reply
  document.querySelector('#compose-form').addEventListener('submit', (event) => {

    //this stops it roloading the page and going to inbox
    event.preventDefault()
    send_mail();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // list emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    // intetate through each email in response adding a div with info
    emails.forEach(element => {
      var emailEntry = document.createElement('div');
      emailEntry.innerHTML = `<div style="display: flex; justify-content: space-between; gap:18px" ><div style="font-weight:900;">${element.sender}</div><div class = "subject">${element.subject}</div></div><div style ="color: grey;">${element.timestamp}</div>`;
      
      emailEntry.style.border = '2px solid black'

      // if the email has been read already set grey background
      if (element.read) {
        emailEntry.style.backgroundColor = '#ddd'
      }
      emailEntry.style.marginBottom = '8px'
      emailEntry.style.padding = '2px'
      emailEntry.style.display = 'flex'
      emailEntry.style.justifyContent = 'space-between'

      // add an event listener to each one linking it to the individual view
      emailEntry.addEventListener('click', () => view_email(element.id, mailbox))
      document.querySelector('#emails-view').appendChild(emailEntry);
      
    });
    
  });

}

// this function is for viewing an individual email
function view_email(id, mailbox){

  // mark the email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })


  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    var singleEmail = document.querySelector('#emails-view');
    
    // no archive button in sent mailbox
    if (mailbox != 'sent'){

      // toggle to archive and unarchive email
      if (!email.archived){
        singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>Reply</button>  <button class='btn btn-warning' id='archiveBtn'>Archive</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
      }else{
        singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>Reply</button>  <button class='btn btn-warning' id='archiveBtn'>Unarchive</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
      }
    }else{
      singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>reply</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
    }
    
    singleEmail.style.padding = '18px'
    
    // connects reply button to compose mode
    var replyBtn = document.querySelector('#replyBtn');
    replyBtn.style.marginTop = '18px'
    replyBtn.addEventListener('click', () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // auto fills fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;

    })

    // marks the email as archived or unarchived when toggling button
    if (mailbox != 'sent'){

      var archiveBtn = document.querySelector('#archiveBtn');
      archiveBtn.style.marginTop = '18px'
      archiveBtn.addEventListener('click', () => {

        console.log('archive clicked')
        if (email.archived){

          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          });
          load_mailbox('archive')

        }else{

          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          });
          load_mailbox('inbox')
        
        }
      
      })
    }
      
  });

}

// submits the email
function send_mail() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())

  // loads the sentbox only after the email is confirmed as sent
  .then(result => {
    console.log(result);
    load_mailbox('sent')
  });
  
  
}