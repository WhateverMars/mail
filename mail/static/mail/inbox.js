document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

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

  // enable send button
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    console.log('this is the compose sending fn')
    event.preventDefault()
    send_mail();
    load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  console.log({mailbox})
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // list emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(element => {
      var emailEntry = document.createElement('div');
      emailEntry.innerHTML = `<div style="display: flex; justify-content: space-between; gap:18px" ><div style="font-weight:900;">${element.sender}</div><div class = "subject">${element.subject}</div></div><div style ="color: grey;">${element.timestamp}</div>`;
      
      emailEntry.style.border = '2px solid black'
      if (element.read) {
        emailEntry.style.backgroundColor = '#ddd'
      }
      emailEntry.style.marginBottom = '8px'
      emailEntry.style.padding = '2px'
      emailEntry.style.display = 'flex'
      emailEntry.style.justifyContent = 'space-between'
      emailEntry.addEventListener('click', () => view_email(element.id))
      document.querySelector('#emails-view').appendChild(emailEntry);
      
    });
    
  });

}

function view_email(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    

    
    var singleEmail = document.querySelector('#emails-view');
    
    if (email.user !== email.sender){
      if (!email.archived){
        singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>reply</button><button class='btn btn-warning' id='archiveBtn'>Archive</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
      }else{
        singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>reply</button><button class='btn btn-warning' id='archiveBtn'>Unarchive</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
      }
    }else{
      singleEmail.innerHTML = `<div style=''><div><strong>From: </strong>${email.sender}</div><div><strong>To: </strong>${email.recipients}</div><div><strong>Subject: </strong>${email.subject}</div><div><strong>Timestamp: </strong>${email.timestamp}</div><button class='btn btn-primary' id='replyBtn'>reply</button></div><div style='margin-top:24px; border-top: 2px solid grey; padding-top: 24px;'>${email.body}</div>`;
    }
    
    singleEmail.style.padding = '18px'
    
    var replyBtn = document.querySelector('#replyBtn');
    replyBtn.style.marginTop = '18px'
    replyBtn.addEventListener('click', () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;

      // enable send button
      document.querySelector('#compose-form').addEventListener('submit', (event) => {
        console.log('this is the compose sending fn')
        event.preventDefault()
        send_mail();
        load_mailbox('sent');
      });
      
    })

    var archiveBtn = document.querySelector('#archiveBtn');
    archiveBtn.style.marginTop = '18px'
    archiveBtn.addEventListener('click', () => {
      if (email.archived){
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        });
        load_mailbox(archived)
      }else{
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        });
        load_mailbox(inbox)
      
      }
    
    })
      
});

  
}

function send_mail() {
  console.log('This means the fn is started');
  console.log(document.querySelector('#compose-recipients').value);
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
}