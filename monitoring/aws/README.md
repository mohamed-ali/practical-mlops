# مراقبة خطوط عمليّات التعلُّم الآلي على  Amazon SageMaker Pipelines

في هذا المثال، نقوم بإنشاء تطبيق [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) لكتابة كود البنية الأساسية (Infrastructure as Code أو IaC) يسمح بأتمتة إنشاء حل لمراقبة حالات [Amazon SageMaker Pipelines](https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines-sdk.html) داخل حساب AWS.

هذا الحلّ يسمح لفريق التعلُّم الآلي المسؤول عن صيانة خطوط الإنتاج المُنسّقة لعمليّات التعلُّم الآلي، مثل تدريب النماذج، والمبنية باستخدام  Amazon SageMaker Pipelines  من الحصول على إشعارات آلية في صيغة بريد إلكتروني عند فشل خط الإنتاج أو إيقافه.

نظرًا لأن تسنيق خطوط إنتاج التعلُّم الآلي باستخدام  Amazon SageMaker Pipelines يعد خيارًا شائعًا على AWS، فإن هذا الحل سيعزز تجربة استخدامه من خلال إعلام فريق التعلم الآلي تلقائيًا بالحالته. 
 

  لاستخدام هذا الحل، قم بتنزيل المجلد `sagemaker-pipelines-monitoring` أو استنسخ هذا المستودع وانتقل إلى المجلد، ثم أضف رسائل البريد الإلكتروني التي ستتلقّى الإشعارات إلى الملف `sagemaker-pipelines-monitoring/emails.yaml` بحيث يكون بهذا التنسيق:

```yaml
emails:
- ml-team-member-1@example.com
- ml-team-member-2@example.com
- ml-team-alias@example.com
```

بمجرد الانتهاء، قم بتثبيت الحل عن طريق تشغيل الأوامر أدناه في طرفية أومر - terminal - تحتوي على aws cdk. يمكنك استعمال طرفية أومر مُعدّة مُسبقًا باستخدام بيئة AWS Cloud9 أو AWS CloudShell،  كما يُمكنك تثبيت AWS CDK على طرفية الأوامر في بيئة عملك المحلية.

1. انتقل إلى المجلد `cd sagemaker-pipelines-monitoring`.
2. قم بتثبيت التبعيات – dependencies – بالأمر `npm clean-install`
3. قم بإعداد cdk في حساب AWS الخاص بك عبر `npx cdk bootstrap`
5. قم بنشر الحل `npx cdk deploy`

سيتلقى المستلمون بريدًا إلكترونيًا لتأكيد رغبتهم في الاشتراك في الإشعارات، وبمجرد التأكيد، سيتلقون رسائل بريد إلكتروني تلقائيًا عند حدوث فشل في SageMaker Pipelines.