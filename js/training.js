(function($, task) {
"use strict";

function Events1() { // training 

	function on_page_loaded(task) {
		
		// $("title").text(task.item_caption);
		// $("#title").text(task.item_caption);
		  
		$("title").text('Training');
		$("#title").text('Training');
		  
		  
		if (task.full_width) {
			$('#container').removeClass('container').addClass('container-fluid');
		}
		$('#container').show();
		
		let menu = [
			['Staff',  [task.staff]],
			{'🗂️ Manage': [task.cohorts, task.training_modules, task.competencies]},
			{'⚙️ Administration': [task.departments, task.roles, '', 
			task.module_categories, task.grades, '', 
			task.cohort_types, '', 
			task.competency_status, task.competency_disciplines, '',
			task.training_log, task.staff_cohorts, '', 
			task.training_users]},
			{'📈  Reports': [task.reporting_v]},
			{'%loggedIn': ['%Role', '%ChangePassword','','%LogOut']},
		];
		
		task.create_menu($("#menu"), $("#content"), {
			custom_menu: menu,
			splash_screen: '<h1 class="text-center">Training</h1>',
			view_first: true,
			create_single_group: false,
			create_group_for_single_item: false
		});
		
		if (task.safe_mode) {
			$(".dropdown-toggle:contains('%loggedIn')").html('👩‍💼 ' +
				task.user_info.user_name + ' <b class="caret"></b>');
			$(".item-menu:contains('%Role')").text('Role: ' + task.user_info.role_name);
			
			$(".item-menu:contains('%LogOut')")
			.text('Log Out')
			.click(function(e) {
				e.preventDefault();
				task.logout();
			});
		}
		
		if (task.change_password.can_view()) {
			$(".item-menu:contains('%ChangePassword')")
			.text('Change Password')
			.click(function(e) {
				e.preventDefault();
				task.change_password.open({open_empty: true});
				task.change_password.append_record();
			});
			
		}
		
		else {
			$(".item-menu:contains('%ChangePassword')").hide();
		}
		
		 $("#menu-right #about a").click(function(e) {
			e.preventDefault();
			task.message(
				task.templates.find('.about'),
				{title: 'Version ' + task.version, margin: 0, text_center: true, 
					buttons: {"OK": undefined}, center_buttons: true}
			);
		});	
	
		// $(document).ajaxStart(function() { $("html").addClass("wait"); });
		// $(document).ajaxStop(function() { $("html").removeClass("wait"); });
	} 
	
	function on_view_form_created(item) {
		var table_options_height = item.table_options.height,
			table_container;
	
		item.clear_filters();
		
		item.view_options.table_container_class = 'view-table';
		item.view_options.detail_container_class = 'view-detail';
		item.view_options.open_item = true;
		
		if (item.view_form.hasClass('modal')) {
			item.view_options.width = 1060;
			item.table_options.height = $(window).height() - 300;
		}
		else {
			if (!item.table_options.height) {
				item.table_options.height = $(window).height() - $('body').height() - 20;
			}
		}
		
		if (item.can_create()) {
			item.view_form.find("#new-btn").on('click.task', function(e) {
				e.preventDefault();
				if (item.master) {
					item.append_record();
				}
				else {
					item.insert_record();
				}
			});
		}
		else {
			item.view_form.find("#new-btn").prop("disabled", true);
		}
	
		item.view_form.find("#edit-btn").on('click.task', function(e) {
			e.preventDefault();
			item.edit_record();
		});
	
		if (item.can_delete()) {
			item.view_form.find("#delete-btn").on('click.task', function(e) {
				e.preventDefault();
				item.delete_record();
			});
		}
		else {
			item.view_form.find("#delete-btn").prop("disabled", true);
		}
		
		
		
		create_print_btns(item);
	
		task.view_form_created(item);
		
		if (!item.master && item.owner.on_view_form_created) {
			item.owner.on_view_form_created(item);
		}
	
		if (item.on_view_form_created) {
			item.on_view_form_created(item);
		}
		
		item.create_view_tables();
		
		if (!item.master && item.view_options.open_item) {
			item.open(true);
		}
	
		if (!table_options_height) {
			item.table_options.height = undefined;
		}
		return true;
	}
	
	function on_view_form_shown(item) {
		$("div.header-history-btn > a").html('<i class="icon-time"></i>');
		
		item.view_form.find('.dbtable.' + item.item_name + ' .inner-table').focus();
	}
	
	function on_view_form_closed(item) {
		if (!item.master && item.view_options.open_item) {	
			item.close();
		}
	}
	
	function on_edit_form_created(item) {
		item.edit_options.inputs_container_class = 'edit-body';
		item.edit_options.detail_container_class = 'edit-detail';
		
		item.edit_form.find("#cancel-btn").on('click.task', function(e) { item.cancel_edit(e) });
		item.edit_form.find("#ok-btn").on('click.task', function() { item.apply_record() });
		if (!item.is_new() && !item.can_modify) {
			item.edit_form.find("#ok-btn").prop("disabled", true);
		}
		
		task.edit_form_created(item);
		
		if (!item.master && item.owner.on_edit_form_created) {
			item.owner.on_edit_form_created(item);
		}
	
		if (item.on_edit_form_created) {
			item.on_edit_form_created(item);
		}
			
		item.create_inputs(item.edit_form.find('.' + item.edit_options.inputs_container_class));
		item.create_detail_views(item.edit_form.find('.' + item.edit_options.detail_container_class));
	
		return true;
	}
	
	function on_edit_form_shown(item) {
		$("div.header-history-btn > a").html('<i class="icon-time"></i>');
	}
	
	
	function on_edit_form_close_query(item) {
		var result = true;
		if (item.is_changing()) {
			if (item.is_modified()) {
				item.yes_no_cancel(task.language.save_changes,
					function() {
						item.apply_record();
					},
					function() {
						item.cancel_edit();
					}
				);
				result = false;
			}
			else {
				item.cancel_edit();
			}
		}
		return result;
	}
	
	function on_filter_form_created(item) {
		item.filter_options.title = item.item_caption + ' - filters';
		item.create_filter_inputs(item.filter_form.find(".edit-body"));
		item.filter_form.find("#cancel-btn").on('click.task', function() {
			item.close_filter_form(); 
		});
		item.filter_form.find("#ok-btn").on('click.task', function() { 
			item.set_order_by(item.view_options.default_order);
			item.apply_filters(item._search_params); 
		});
	}
	
	function on_param_form_created(item) {
		item.create_param_inputs(item.param_form.find(".edit-body"));
		item.param_form.find("#cancel-btn").on('click.task', function() { 
			item.close_param_form();
		});
		item.param_form.find("#ok-btn").on('click.task', function() { 
			item.process_report();
		});
	}
	
	function on_before_print_report(report) {
		var select;
		report.extension = 'pdf';
		if (report.param_form) {
			select = report.param_form.find('select');
			if (select && select.val()) {
				report.extension = select.val();
			}
		}
	}
	
	function on_view_form_keyup(item, event) {
		if (event.keyCode === 45 && event.ctrlKey === true){
			if (item.master) {
				item.append_record();
			}
			else {
				item.insert_record();				
			}
		}
		else if (event.keyCode === 46 && event.ctrlKey === true){
			item.delete_record(); 
		}
	}
	
	function on_edit_form_keyup(item, event) {
		if (event.keyCode === 13 && event.ctrlKey === true){
			item.edit_form.find("#ok-btn").focus(); 
			item.apply_record();
		}
	}
	
	function create_print_btns(item) {
		var i,
			$ul,
			$li,
			reports = [];
		if (item.reports) {
			for (i = 0; i < item.reports.length; i++) {
				if (item.reports[i].can_view()) {
					reports.push(item.reports[i]);
				}
			}
			if (reports.length) {
				$ul = item.view_form.find("#report-btn ul");
				for (i = 0; i < reports.length; i++) {
					$li = $('<li><a href="#">' + reports[i].item_caption + '</a></li>');
					$li.find('a').data('report', reports[i]);
					$li.on('click', 'a', function(e) {
						e.preventDefault();
						$(this).data('report').print(false);
					});
					$ul.append($li);
				}
			}
			else {
				item.view_form.find("#report-btn").hide();
			}
		}
		else {
			item.view_form.find("#report-btn").hide();
		}
	}
	this.on_page_loaded = on_page_loaded;
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_view_form_closed = on_view_form_closed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_filter_form_created = on_filter_form_created;
	this.on_param_form_created = on_param_form_created;
	this.on_before_print_report = on_before_print_report;
	this.on_view_form_keyup = on_view_form_keyup;
	this.on_edit_form_keyup = on_edit_form_keyup;
	this.create_print_btns = create_print_btns;
}

task.events.events1 = new Events1();

function Events6() { // training.catalogs.staff 

	var aMode = '';
	
	
	function on_view_form_created(item) {
		if (task.staff.can_edit()) {
			var btnT = item.add_view_button('🎓 Log Training', {type: 'primary'});
			btnT.click(function() {
				aMode = 't';
				$('[href="#0"]').trigger('click');
				item.edit_record();
				
			});	   
			
			var btnC = item.add_view_button('👨‍👨‍👧‍👧 Cohorts', {type: 'primary'});
			btnC.click(function() {
				aMode = 'c';
				$('[href="#1"]').trigger('click');
				item.edit_record();
			});
	
			var btnTC = item.add_view_button('📝 Competency', {type: 'primary'});
			btnTC.click(function() {
				aMode = 'tc';
				$('[href="#2"]').trigger('click');
				item.edit_record();
			});
			
			var btnN = item.add_view_button('📝 Add Note', {type: 'primary'});
			btnN.click(function() {
				aMode = 'n';
				$('[href="3"]').trigger('click');
				item.edit_record();
			});
			
		}
		
		//else {
		//	$('#edit-btn').attr('disabled','');
		//}
		
	}
	
	
	function on_edit_form_created(item) {
		//console.log(item.item_state);
		if (item.item_state === 2) {
			//console.log('We\'re creating a new record');
			var save_btn = item.add_edit_button(
				'Save new staff member', {btn_id: 'save-new-staff-btn', image: 'icon-hdd'});
			save_btn.click(function() {
				save_new_staff(item);
			});
			
		}
	}
	
	
	function on_edit_form_shown(item) {
		// if we're creating a new record I want to ensure that the new
		// staff member is saved to the database and we get an ID back before
		// people start adding cohorts or training logs
		if (item.item_state === 2) {
			$(".staff.edit-form").find('#delete-btn').prop('disabled', true);
			$(".staff.edit-form").find('#edit-btn').prop('disabled', true);
			$(".staff.edit-form").find('#new-btn').prop('disabled', true);
			$(".staff.edit-form").find('#ok-btn').hide();
		}
		
	
		if (aMode == 'c') {
			aMode = '';
			$('[href="#tab11"]').trigger('click');
			item.staff_cohorts.insert_record();
		}
		
		 if (aMode == 'tc') {
			aMode = '';
			$('[href="#tab21"]').trigger('click');
			item.competency_transcript.insert_record();
		}
		
		if (aMode == 'n') {
			aMode = '';
			$('[href="#tab31"]').trigger('click');
			item.staff_notes.insert_record();
		}
		
		if (aMode == 't') {
			aMode = '';
			item.training_log.insert_record();
		}
	}
	
	
	function save_new_staff(item) {
		if (item.is_changing()) {
			item.post();
			try {
				item.apply();
			}
			catch (e) {
			  item.alert_error(error);
			}
			item.edit();
			// renable the buttons to allow association with cohort, log training etc.
			$(".staff.edit-form").find('#delete-btn').prop('disabled', false);
			$(".staff.edit-form").find('#edit-btn').prop('disabled', false);
			$(".staff.edit-form").find('#new-btn').prop('disabled', false);
			$(".staff.edit-form").find('#ok-btn').show();
			$(".staff.edit-form").find('#save-new-staff-btn').remove();
			
		}
	}
	
	
	function on_field_get_html(field) {
		var bfc = ['antenna_access'];
		if (bfc.includes(field.field_name) && field.value) {
			return '<span>✔️</span>';
		}
		
		var bfx = ['ex_employee'];
		 if (bfx.includes(field.field_name) && field.value) {
			return '<span>❌</span>';
		}
		
	
	}
	this.on_view_form_created = on_view_form_created;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_shown = on_edit_form_shown;
	this.save_new_staff = save_new_staff;
	this.on_field_get_html = on_field_get_html;
}

task.events.events6 = new Events6();

function Events10() { // training.catalogs.cohorts 

	function on_view_form_created(item) {
		if (task.staff.can_edit()) {
			var btnLogTraining = item.add_view_button('✅ Attendance ', 
			{type: 'primary', btn_id: 'log-training-btn'});
			btnLogTraining.click(function() {
				log_training(item);
			});
		}
	
		var btnEmail = item.add_view_button('📧 Email', 
			{type: 'primary', btn_id: 'send-email-btn'});
		btnEmail.click(function() {
			send_email(item);
		});
		
		item.table_options.height -= 350;
		item.sc = task.staff_cohorts.copy();
	
	}
	
	
	function on_view_form_shown(item) {
		item.refresh_page();  //fixes slightly annoying render bug
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
	
	
	function log_training(item) {
		
		if (item.sc.selections.length) {
			var staff_ids = [];
			var count = item.sc.selections.length;
			let scc = item.sc.copy();
			scc.set_where({id__in: item.sc.selections});
			scc.open();
			scc.each(function(s){
				staff_ids.push(s.staff_number.value);
				
			});
			
			let staff_copy = task.staff.copy();
			staff_copy.open({open_empty: true});
			staff_copy.append();
			staff_copy.training_log.open();
			
			staff_copy.training_log.on_after_post = function(d) {
				let sels = task.staff.copy();
				sels.set_where({id__in: staff_ids});
				sels.open();
				sels.each(function(s) {
					s.edit();
					s.training_log.open();
					s.training_log.append();
					s.training_log.each_field(function(f) {
						if (!f.system_field()) {
							f.value = d.field_by_name(f.field_name).value;
						}
					});
					s.training_log.staff_number.value = s.id.value;
					s.training_log.post();
					s.post();
				});
				item.sc.selections = [];
				sels.apply();
				item.refresh_page();
			};
	
			staff_copy.training_log.edit_options.title = 
			"✅ Register training attendance for " + count + " staff";
			staff_copy.training_log.append_record();
			
		 }
		 
		 else {
			 item.alert("No staff selected");
		 }
	
	}
	
	function send_email(item) {
		/* 
		 * using the same approach as above to take the selections
		 * and get a dataset from the staff table containing those records
		 * 
		 * iterate through that dataset and grab the staff_numbers
		 * 
		 * add the .example.com suffix to the staff_numbers and finally copy that
		 * out to the clipboard to be pasted into the address field in Outlook
		 *
		 */ 
		
		if (item.sc.selections.length) {
		var staff_ids = [];
		var staff_numbers = [];
			var count = item.sc.selections.length;
			let scc = item.sc.copy();
			scc.set_where({id__in: item.sc.selections});
			scc.open();
			scc.each(function(s){
				staff_ids.push(s.staff_number.value);
			});
			
		let staff_copy = task.staff.copy();
		staff_copy.set_where({id__in: staff_ids});
		staff_copy.open();
		staff_copy.each(function(s) {
			staff_numbers.push(staff_copy.staff_number.value);
		});
	
		var email_list = staff_numbers.join("@example.com; ") + "@example.com;" 
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val(email_list).select();
		document.execCommand("copy");
		$temp.remove();
		item.alert("Email address list copied to clipboard.")
		}
		
		else {
			item.alert('No staff selected');
		}
	}
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_after_scroll = on_after_scroll;
	this.log_training = log_training;
	this.send_email = send_email;
}

task.events.events10 = new Events10();

function Events23() { // training.catalogs.staff.staff_cohorts 

	function on_edit_form_created(item) {
		var current_staff_id = task.staff.id.value;
		item.staff_number.value = current_staff_id;
		$('[href="#tab11"]').trigger('click');
	}
	this.on_edit_form_created = on_edit_form_created;
}

task.events.events23 = new Events23();

function Events25() { // training.catalogs.staff.training_log 

	function on_edit_form_created(item) {
		var current_staff_id = task.staff.id.value;
		item.staff_number.value = current_staff_id;
	}
	
	function on_field_get_html(field) {
		var bfc = ["complete"]
		if (bfc.includes(field.field_name) && field.value) {
			return '<span>✔️</span>';
		}
	}
	this.on_edit_form_created = on_edit_form_created;
	this.on_field_get_html = on_field_get_html;
}

task.events.events25 = new Events25();

function Events26() { // training.catalogs.training_modules 

	function on_field_get_html(field) {
		var bfc = ['current'];
		if (bfc.includes(field.field_name) && field.value) {
			return '<span>✔️</span>';
		}
	}
	this.on_field_get_html = on_field_get_html;
}

task.events.events26 = new Events26();

function Events30() { // training.authentication.training_users 

	function on_field_get_text(field) {
		var item = field.owner;
		if (field.field_name === 'password') {
			if (item.id.value || field.value) {
				return '**********';
			}
		}
	}
	this.on_field_get_text = on_field_get_text;
}

task.events.events30 = new Events30();

function Events31() { // training.authentication.change_password 

	function on_edit_form_created(item) {
		item.edit_form.find("#ok-btn")
			.off('click.task')
			.on('click', function() { 
				change_password(item); 
			});
		item.edit_form.find("#cancel-btn")
			.off('click.task')
			.on('click', function() { 
				item.close_edit_form(); 
			});
	}
	
	function change_password(item) {
		item.post();
		item.server('change_password', [item.old_password.value, item.new_password.value], function(res) {
			if (res) {
				item.warning('Password has been changed. <br> The application will be reloaded.', 
					function() {
						task.logout();
						location.reload(); 
					});
			}
			else {
				item.alert_error("Can't change the password.");	
				item.edit();
			}
		});
	}
	
	function on_field_changed(field, lookup_item) {
		var item = field.owner;
		var oldPassError = $('<div id="oldpassworderror" style="margin-left: 180px; margin-bottom: 12px;">Old password entered incorrectly.</div>');
		if (field.field_name === 'old_password') {
			$('#oldpassworderror').hide();
			item.server('check_old_password', [field.value], function(error) {
				if (error) {
					item.alert_error(error);
					oldPassError.insertAfter('div.control-group:nth-child(1)');
					
				}
			});
		}
	}
	
	function on_edit_form_close_query(item) {
		return true;
	}
	this.on_edit_form_created = on_edit_form_created;
	this.change_password = change_password;
	this.on_field_changed = on_field_changed;
	this.on_edit_form_close_query = on_edit_form_close_query;
}

task.events.events31 = new Events31();

function Events35() { // training.catalogs.competencies 

	function on_field_get_html(field) {
		var bfc = ['timed'];
		if (bfc.includes(field.field_name) && field.value) {
			return '<span>✔️</span>';
		}
		
		/** var bfx = ['ex_employee'];
		 if (bfx.includes(field.field_name) && field.value) {
			return '<span>❌</span>';
		} **/
		
	
	}
	this.on_field_get_html = on_field_get_html;
}

task.events.events35 = new Events35();

function Events37() { // training.details.competency_transcript 

	function on_field_get_text(field) {
		let item = field.owner;
		if (field.field_name === 'assessor_name') {
			return item.assessor_first_name.value + ' ' + item.assessor_surname.value;
			}
	}
	this.on_field_get_text = on_field_get_text;
}

task.events.events37 = new Events37();

function Events38() { // training.catalogs.staff.competency_transcript 

	function on_edit_form_created(item) {
		var current_staff_id = task.staff.id.value;
		item.staff_number.value = current_staff_id;
		$('[href="#tab21"]').trigger('click');
	}
	
	function on_field_get_html(field) {
		let item = field.owner;
		if (field.field_name === 'assessor_name') {
			return item.assessor_first_name.lookup_value + ' ' + item.assessor_surname.lookup_value;
			}
			
		if (field.field_name === 'evidence') {
			let url = '/static/files/' + field.lookup_value;
			return '<div style="text-align: center; text-size: larger;">' +
			'<a href="' + url + '" target="_blank">📃</a></div>';
		}
	}
	this.on_edit_form_created = on_edit_form_created;
	this.on_field_get_html = on_field_get_html;
}

task.events.events38 = new Events38();

function Events39() { // training.catalogs.staff.staff_notes 

	function on_edit_form_created(item) {
		$('[href="#tab31"]').trigger('click');
	}
	this.on_edit_form_created = on_edit_form_created;
}

task.events.events39 = new Events39();

function Events42() { // training.reporting.reporting_v 

	function on_view_form_created(item) {
		var btnRTest = item.add_button($('.reporting-buttons'), 
			'Reporting Testing', 
			{
			type: 'primary'
			}
		);
		btnRTest.click(function(){
			report_one()}
			);
	}
	
	function report_one() {
		console.log('I did something.');
		// do something here perhaps
	}
	this.on_view_form_created = on_view_form_created;
	this.report_one = report_one;
}

task.events.events42 = new Events42();

})(jQuery, task)