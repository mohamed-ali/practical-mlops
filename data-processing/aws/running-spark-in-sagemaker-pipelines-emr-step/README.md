# استخدام EMR لتشغيل تطبيقات Spark ضمن SageMaker Pipelines

يوضح هذا المثال كيفية إعداد أذونات IAM اللازمة لدمج Amazon EMR مع SageMaker، مما يسمح لك باستخدام [EMRStep](https://docs.aws.amazon.com/sagemaker/latest/dg/build-and-manage-steps.html#step-type-emr) في SageMaker Pipelines لتشغيل تطبيقات Spark.

SageMaker Pipelines هي إحدى إمكانيات Amazon SageMaker عالية المستوى التي تتيح لك إنشاء سير عمل التعلم الآلي من البداية إلى النهاية وأتمتتها وإدارتها. إحدى الخطوات في SageMaker Pipeline هي `EMRStep`، والتي تمكنك من تشغيل تطبيقات Apache Spark على مجموعة Amazon EMR مباشرة من SageMaker Pipeline.

لاستخدام `EMRStep`، تحتاج إلى تكوين أذونات IAM والأدوار المطلوبة. يوفر هذا المثال الإرشادات لإعداد هذه الأذونات باستخدام تطبيق AWS Cloud Development Kit (CDK). يقوم تطبيق CDK بإنشاء وتكوين كيانات IAM الضرورية، مثل دور خدمة EMR وملف تعريف مثيل EC2 وسياسة مُدارة لدور تنفيذ SageMaker.

من خلال اتباع الإرشادات الواردة في هذا المثال، ستتمكن من دمج Amazon EMR مع SageMaker Pipelines، مما يتيح لك الاستفادة من قوة Apache Spark داخل سير عمل التعلم الآلي بسلاسة.

## الإرشادات

1. انسخ المجلد `sagemaker-pipelines-emr-setup` الذي يحتوي على مجموعة CDK إلى AWS CloudShell.

2. قم بتثبيت التبعيات المطلوبة باتباع الخطوات التالية:
- انتقل إلى المجلد باستخدام `cd sagemaker-pipelines-emr-setup`
- قم بتشغيل `npm clean-install` لتثبيت حزم Node.js المطلوبة
- قم بتشغيل `npx cdk bootstrap` لتمهيد بيئة AWS CDK
- قم بتشغيل `npx cdk deploy` لنشر مجموعة CDK

3. بمجرد تثبيت المجموعة، ابحث عن دور تنفيذ SageMaker الخاص بنطاقك. يمكنك تحديد موقع هذا الدور باتباع الخطوات التالية:
- قم بتشغيل الخلية في دفتر الملاحظات لتحديد دور تنفيذ SageMaker (على سبيل المثال، `AmazonSageMaker-ExecutionRole-XXXXXX`).
- انتقل إلى وحدة تحكم IAM وابحث عن اسم الدور المطبوع أعلاه في شريط البحث.
- انقر فوق الدور لفتح تفاصيله.

4. قم بإرفاق سياسات IAM المطلوبة بدور تنفيذ SageMaker:
- انقر فوق "إضافة أذونات" على الجانب الأيمن من صفحة تفاصيل الدور.
- ابحث عن السياسة المسماة `EMRSageMakerPipelinesIntegration` (التي أنشأها تطبيق CDK)، وحددها، وانقر فوق "إضافة أذونات".
- كرر نفس العملية لإضافة سياسة AWS المُدارة `AmazonSageMakerPipelinesIntegrations` إلى الدور.

5. بعد إرفاق السياسات اللازمة، يمكنك تشغيل دفتر الملاحظات من البداية إلى النهاية. سينشئ SageMaker مجموعة EMR ويشغل تطبيق Spark عليها. ستنتهي المجموعة تلقائيًا بمجرد انتهاء تشغيل التطبيق.

يقوم تطبيق CDK بإعداد كيانات IAM التالية المطلوبة لهذا التكامل:

- **دور الخدمة لـ Amazon EMR (دور EMR)**: يتم تمرير هذا الدور كمعلمة `ServiceRole`. تم تسمية الدور باسم `arn:aws:iam::{account}:role/service-role/AmazonEMR-ServiceRole-ForSageMakerPipelines` وتمت الإشارة إليه في دفتر الملاحظات.
- **ملف تعريف المثيل لمثيلات EC2 العنقودية (ملف تعريف مثيل EC2)**: يتم تمرير هذا كمعلمة `JobFlowRole`. تم تسمية ملف تعريف المثيل باسم `arn:aws:iam::{account}:instance-profile/service-role/AmazonEMR-InstanceProfile-ForSageMakerPipelines` وتمت الإشارة إليه في دفتر الملاحظات.
- **سياسة مُدارة لدور تنفيذ SageMaker**: يجب إرفاق هذه السياسة بدور تنفيذ SageMaker المستخدم بواسطة خط أنابيب SageMaker.

لمزيد من التفاصيل حول دور الخدمة وملف تعريف المثيل، راجع وثائق [EMR IAM roles](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-iam-roles.html).