# Cohorts Training Jam.py Application 

Welcome! This is the Application for managing staff training developed with Jam.py Application Builder.

To get you going with the most daunting question of database design - master-details, here is a short **how to** link the tables in Jam.py.

The database has a table **staff** which has a bunch of Details views, one of which is **staff_cohorts** (training classes) which links **staff** and **cohorts** in a many-to-many relationship:

![Staff](https://github.com/platipusica/Cohorts/blob/master/images/test/Auto%20Generated%20Inline%20Image%201.png)

On the design of the **staff_cohorts** details table I include a lookup to **staff_number** - this will effectively be a duplicate of the value of **master_rec_id** as above (shown in red).  I also use this to then include all the things from the **staff** table (and associated tables) I want to see from my **cohorts** view of the data as lookups bound to this (shown in green)


![Staff Cohorts](https://github.com/platipusica/Cohorts/blob/master/images/test/Auto%20Generated%20Inline%20Image%202.png)

To view the code below, open the Application Builder https://cohortstraining.herokuapp.com/builder.html and navigate to Project/Task/Groups/Forms, click on "Staff" table and "Client Module", than on "Cohorts" table, etc.

I hide all these extra fields from the View form and Edit forms of staff_cohorts

When I open the Edit form of staff_cohorts, I programmatically set the value of the staff_number field:

```
function on_edit_form_created(item) {
    var current_staff_id = task.staff.id.value;
    item.staff_number.value = current_staff_id;
}
```

On the cohorts table I don't have any details associated, instead I create the details view of the staff_cohorts using the following code:

```
function on_view_form_created(item) {

    item.table_options.height -= 350;
    item.sc = task.staff_cohorts.copy();
}


function on_after_scroll(item) {
if (item.view_form.length) {
      if (item.rec_count) {
          item.sc.set_fields(['staff_number', 'first_name', 'surname', 'role',
          'department', 'master_id', 'master_rec_id', 'id', 'deleted']);
          item.sc.set_order_by(['surname']);
          item.sc.set_where({cohort_index: item.id.value});
          item.sc.create_table(item.view_form.find('.view-detail'), {
              height: 300,
              multiselect: true,
              select_all: true,
              summary_fields: ['staff_number'],
          });
          item.sc.open(true);
      }
      else {
          item.sc.close();
      }
    }
}


function on_view_form_shown(item) {
    item.refresh_page();  //fixes slightly annoying render bug
}
```

The render bug is that the column sizing doesn't auto-correct until you first scroll, the refresh fixes that.

Hopefully this helps!
