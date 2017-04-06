$(document).ready(function(){
  var data={
    RunLog:[{"id": "0", "date": "03/20/17", "time": "30 minutes", "distance": "3 miles", "location": "city park", "weather": "sunny", "mood": "grumpy", "notes": "ran with new shoes"},
    {"id": "1", "date": "03/21/17", "time": "45 minutes", "distance": "5 miles", "location": "sloans lake", "weather": "rainy", "mood": "happy"},
    {"id": "2", "date": "03/22/17", "time": "20 minutes", "distance": "2 miles", "location": "neighborhood", "weather": "snowy", "mood": "cold", "notes": "snowy run.  had to end early"},
    {"id": "3", "date": "03/23/17", "time": "45 minutes", "distance": "6 miles", "location": "mountains", "weather": "sunny", "mood": "happy"},
    {"id": "4", "date": "03/24/17", "time": "30 minutes", "distance": "3 miles", "location": "rains park", "weather": "cloudy", "mood": "tired", "notes": "tired so stopped running"}]
  };
  $('#login').hide();
  //$('#viewruns').hide();
  $('#addruns');
  //$('#rundetails').hide();

  //$('#rundetails').hide();

  $('#start').mousedown(function() {
      $('#splashpage').hide();
      $('#login').show();
    });

  function getRuns(){
    $.getJSON("/log",function(data){
      displayRuns(data);
    })
  }

  function displayRuns(data){
    var html = `<table><thead><tr><th>Date</th><th>Time</th><th>Distance</th><th>Actions</th></tr></thead><tbody>`
    for (var i=0; i < data.length; i++) {
      html += `<tr data-id="${data[i].id}"><td>${data[i].date.slice(0,10)}</td>
        <td>${data[i].time}</td>
        <td>${data[i].distance}</td>
        <td><i class="fa fa-pencil edit"></i>
        <i class="fa fa-times delete"></i>
        <i class="fa fa-info details"></i></td></tr>`;
    }
    html += `</tbody></table>`
    $('#viewruns').html(html);
  }
  getRuns();

  $(document).on("click",".details",function(){
    var id = $(this).parent().parent().attr("data-id");
    displayDetails(data, id);
  });

  $(document).on("click",".delete",function(){
    var id = $(this).parent().parent().attr("data-id");
    deleteRun(data, id);
  });

  $(document).on("click",".edit",function(){
    var id = $(this).parent().parent().attr("data-id");
    editRuns(data, id);
  });

  $('#addruns').submit(function(e){
    e.preventDefault();
    var runObj= {};
    runObj.date=$("#dateofrun").val();
    runObj.time=$("#timeofrun").val();
    runObj.distance=$("#distanceofrun").val();
    runObj.location=$("#locationofrun").val();
    runObj.weather=$("#weatherrun").val();
    runObj.mood=$("#moodrun").val();
    runObj.notes=$("#notesrun").val();
    
    $.ajax({
      url: "/log",
      method: "POST",
      data: JSON.stringify(runObj),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        getRuns();
        console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    })
  })

  function editRuns(data, id){
    displayDetails(data);

  }

  function displayDetails(data, id){
    var html = `<table><thead><tr><th>Date</th><th>Time</th><th>Distance</th><th>Location</th>
                <th>Weather</th><th>Mood</th><th>Notes</th></tr></thead><tbody>`
    
      html += `<tr data-id="${data.RunLog[id].id}"><td>${data.RunLog[id].date}</td>
        <td>${data.RunLog[id].time}</td>
        <td>${data.RunLog[id].distance}</td>
        <td>${data.RunLog[id].location}</td>
        <td>${data.RunLog[id].weather}</td>
        <td>${data.RunLog[id].mood}</td>
        <td>${data.RunLog[id].notes}</td>`;
       
    html += `</tbody></table>`;
    $('#rundetails').html(html);
  }

  function deleteRun(data, id){
    $.ajax({
      url: "/log/"+id,
      method: "DELETE",
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    })
    getRuns();
  }

 });