# Cohorts Training Jam.py Application 

Welcome! This is the Application for managing staff training developed with Jam.py.

The database has a table staff which has a bunch of details views, one of which is staff_cohorts (training classes) which links staff and cohorts in a many-to-many relationship:

(https://github.com/platipusica/Cohorts/blob/master/images/test/Auto%20Generated%20Inline%20Image%201.png)

On the design of the *staff_cohorts* details table I include a lookup to *staff_number* - this will effectively be a duplicate of the value of master_rec_id as above (shown in red).  I also use this to then include all the things from the staff table (and associated tables) I want to see from my cohorts view of the data as lookups bound to this (shown in green)


(https://github.com/platipusica/Cohorts/blob/master/images/test/Auto%20Generated%20Inline%20Image%202.png)
